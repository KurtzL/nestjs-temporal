import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { Worker } from '@temporalio/worker';
import { ActivityInterface } from '@temporalio/activity';
import { TEMPORAL_WORKER_CONFIG } from './temporal.constants';

@Injectable()
export class TemporalExplorer implements OnModuleInit {
  private readonly injector = new Injector();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TemporalMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  async onModuleInit() {
    await this.explore();
  }

  async explore() {
    const workerConfig = this.moduleRef.get(TEMPORAL_WORKER_CONFIG, {
      strict: false,
    });

    const activitiesFunc: ActivityInterface = await this.handleActivities();

    const worker = await Worker.create(
      Object.assign(
        {
          taskQueue: 'default',
          activities: activitiesFunc,
        },
        workerConfig,
      ),
    );

    (worker as any as OnApplicationShutdown).onApplicationShutdown = function (
      this: Worker,
    ) {
      return this.shutdown();
    };

    await worker.run();
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

  /**
   *
   * @returns
   */
  async handleWorkflow(): Promise<any> {
    const workflowMethod = {};

    const workflows: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isWorkflows(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    workflows.forEach((wrapper: InstanceWrapper) => {
      const { instance, metatype } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      //
      const activitiesOptions = this.metadataAccessor.getWorkflows(
        instance.constructor || metatype,
      );

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        async (key: string) => {
          if (this.metadataAccessor.isWorkflowMethod(instance[key])) {
            const metadata = this.metadataAccessor.getWorkflowMethod(
              instance[key],
            );

            if (isRequestScoped) {
              // TODO: handle request scoped
            } else {
              workflowMethod[key] = instance[key].bind(instance);
            }
          }
        },
      );
    });

    return workflowMethod;
  }
}
