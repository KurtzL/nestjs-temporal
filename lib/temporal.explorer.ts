import {
  Injectable,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { Worker, WorkerOptions, Core, CoreOptions } from '@temporalio/worker';
import { ActivityInterface } from '@temporalio/activity';
import {
  TEMPORAL_CORE_CONFIG,
  TEMPORAL_WORKER_CONFIG,
} from './temporal.constants';

@Injectable()
export class TemporalExplorer
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  private readonly injector = new Injector();
  private worker: Worker;

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TemporalMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  onModuleDestroy() {
    this.worker.shutdown();
  }

  onApplicationBootstrap() {
    setTimeout(() => {
      this.worker.run();
    }, 1000);
  }

  async explore() {
    const workerConfig: WorkerOptions = this.getWorkerConfigOptions();
    const coreConfig: CoreOptions = this.getCoreConfigOptions();

    // should contain taskQueue
    if (workerConfig.taskQueue) {
      const activitiesFunc: ActivityInterface = await this.handleActivities();

      await Core.install(coreConfig);

      this.worker = await Worker.create(
        Object.assign(
          {
            activities: activitiesFunc,
          },
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

  getCoreConfigOptions(name?: string): CoreOptions {
    return this.moduleRef.get(TEMPORAL_CORE_CONFIG || name, { strict: false });
  }

  /**
   *
   * @returns
   */
  async handleActivities(): Promise<ActivityInterface> {
    const activitiesMethod: ActivityInterface = {};

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
