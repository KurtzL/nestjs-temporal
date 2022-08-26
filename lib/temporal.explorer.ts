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
  private connection: NativeConnection | undefined;
  private workerPromises: Promise<void>[] = [];
  private workers: Worker[] = [];
  private activities: UntypedActivities;

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
    try {
      this.workers.map( worker => worker.shutdown());
      await Promise.all(this.workerPromises);
      await this.connection.close();
    } catch (e) {
      console.error('Workers or connection already closed');
    }
  }

  async runWorker(workerOptions?: Partial<WorkerOptions>): Promise<{worker: Worker, workerPromise: Promise<void>}> {
    const newWorkerConfig: WorkerOptions = {
      ...this.getWorkerConfigOptions(),
      activities: this.activities,
      connection: this.connection,
      ...workerOptions,
    }
    const worker = await Worker.create(newWorkerConfig);
    const workerPromise = worker.run();
    const workerObject = { worker, workerPromise };
    this.workers.push(worker);
    this.workerPromises.push(workerPromise);
    return workerObject;
  }

  async explore() {
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
    });
    const nativeConnectionConfig: NativeConnectionOptions = this.getNativeConnectionConfigOptions();
    this.connection = await NativeConnection.connect(nativeConnectionConfig);
    this.activities = await this.handleActivities();
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
