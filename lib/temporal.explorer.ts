import {
  Injectable,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { Worker, WorkerOptions, NativeConnection, NativeConnectionOptions, Runtime } from '@temporalio/worker';
import { UntypedActivities } from '@temporalio/activity';
import {
  TEMPORAL_NATIVE_CONNECTION_CONFIG,
  TEMPORAL_WORKER_CONFIG,
} from './temporal.constants';

@Injectable()
export class TemporalExplorer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly injector = new Injector();
  private worker: Worker;
  private connection: NativeConnection | undefined;
  private workerPromise: Promise<void>;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TemporalMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  async onModuleDestroy() {
    await this.workerPromise;
    await this.connection?.close();
  }

  async runWorker() {
    this.workerPromise = this.worker.run();
    await this.workerPromise;
  }

  async explore() {
    const workerConfig: WorkerOptions = this.getWorkerConfigOptions();

    Runtime.install({
      // TODO: Logging
      telemetryOptions: {
        // logging: {
        //   forward: { level: 'INFO' },
        // },
        ...(process.env.DD_AGENT_HOST
          ? { metrics: { otel: { url: `http://${process.env.DD_AGENT_HOST}:4317` } } }
          : {}),
      },
    });;
    const nativeConnectionConfig: NativeConnectionOptions = this.getNativeConnectionConfigOptions();

    // should contain taskQueue
    if (workerConfig.taskQueue) {
      const activitiesFunc = await this.handleActivities();
      this.connection = await NativeConnection.connect(nativeConnectionConfig);
      const newWorkerConfig = Object.assign(
        {
          activities: activitiesFunc,
          connection: this.connection,
        },
        workerConfig,
      );
      this.worker = await Worker.create(newWorkerConfig);
    }
  }

  getWorkerConfigOptions(name?: string): WorkerOptions {
    return this.moduleRef.get(TEMPORAL_WORKER_CONFIG || name, {
      strict: false,
    });
  }

  getNativeConnectionConfigOptions(name?: string): NativeConnectionOptions {
    return this.moduleRef.get(TEMPORAL_NATIVE_CONNECTION_CONFIG || name, { strict: false });
  }

  /**
   *
   * @returns
   */
  async handleActivities(): Promise<UntypedActivities> {
    const activitiesMethod: UntypedActivities = {};

    const activities: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isActivities(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    activities.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      //
      const activitiesOptions = this.metadataAccessor.getActivities(
        instance.constructor || metatype,
      );

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        async (key: string) => {
          if (this.metadataAccessor.isActivity(instance[key])) {
            const metadata = this.metadataAccessor.getActivity(instance[key]);

            let args: unknown[] = [metadata?.name];

            if (isRequestScoped) {
              // TODO: handle request scoped
            } else {
              activitiesMethod[key] = instance[key].bind(instance);
            }
          }
        },
      );
    });

    return activitiesMethod;
  }
}
