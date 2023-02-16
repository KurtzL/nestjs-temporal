import {
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import {
  NativeConnection,
  NativeConnectionOptions,
  Runtime,
  RuntimeOptions,
  Worker,
  WorkerOptions,
} from '@temporalio/worker';

import {
  TEMPORAL_CONNECTION_CONFIG,
  TEMPORAL_CORE_CONFIG,
  TEMPORAL_WORKER_CONFIG,
} from './temporal.constants';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { ActivityOptions } from './decorators';

@Injectable()
export class TemporalExplorer
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
  private readonly logger = new Logger(TemporalExplorer.name);
  private readonly injector = new Injector();
  private worker: Worker;
  private timerId: ReturnType<typeof setInterval>;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TemporalMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) { }

  clearInterval() {
    this.timerId && clearInterval(this.timerId);
    this.timerId = null;
  }

  async onModuleInit() {
    await this.explore();
  }

  onModuleDestroy() {
    this.worker?.shutdown();
    this.clearInterval();
  }

  onApplicationBootstrap() {
    this.timerId = setInterval(() => {
      if (this.worker) {
        this.worker.run();
        this.clearInterval();
      }
    }, 1000);
  }

  async explore() {
    const workerConfig = this.getWorkerConfigOptions();
    const runTimeOptions = this.getRuntimeOptions();
    const connectionOptions = this.getNativeConnectionOptions();

    // should contain taskQueue
    if (workerConfig.taskQueue) {
      const activitiesFunc = await this.handleActivities();

      if (runTimeOptions) {
        this.logger.verbose('Instantiating a new Core object');
        Runtime.install(runTimeOptions);
      }

      const workerOptions = {
        activities: activitiesFunc,
      } as WorkerOptions;
      if (connectionOptions) {
        this.logger.verbose('Connecting to the Temporal server');
        workerOptions.connection = await NativeConnection.connect(connectionOptions);
      }

      this.logger.verbose('Creating a new Worker');
      this.worker = await Worker.create(
        Object.assign(
          workerOptions,
          workerConfig,
        ),
      );
    }
  }

  getWorkerConfigOptions(name?: string): WorkerOptions {
    return this.moduleRef.get(TEMPORAL_WORKER_CONFIG || name, {
      strict: false,
    });
  }

  getNativeConnectionOptions(name?: string): NativeConnectionOptions {
    return this.moduleRef.get(TEMPORAL_CONNECTION_CONFIG || name, {
      strict: false,
    });
  }

  getRuntimeOptions(name?: string): RuntimeOptions {
    return this.moduleRef.get(TEMPORAL_CORE_CONFIG || name, { strict: false });
  }

  /**
   *
   * @returns
   */
  async handleActivities() {
    const activitiesMethod = {};

    const activities: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isActivities(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    const activitiesLoader = activities.flatMap((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      //
      const activitiesOptions = this.metadataAccessor.getActivities(
        instance.constructor || metatype,
      );

      return this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        async (key: string) => {
          if (this.metadataAccessor.isActivity(instance[key])) {
            const metadata = this.metadataAccessor.getActivity(instance[key]) as ActivityOptions;

            let activityName = key;
            if (metadata?.name) {
              if (typeof metadata.name === 'string') {
                activityName = metadata.name
              }
              else {
                const activityNameResult = metadata.name(instance);
                if (typeof activityNameResult === 'string') {
                  activityName = activityNameResult
                }
                else {
                  activityName = await activityNameResult;
                }
              }
            }

            if (isRequestScoped) {
              // TODO: handle request scoped
            } else {
              activitiesMethod[activityName] = instance[key].bind(instance);
            }
          }
        },
      );
    });
    await Promise.all(activitiesLoader);
    return activitiesMethod;
  }
}
