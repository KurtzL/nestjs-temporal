import { Injectable, OnModuleInit } from '@nestjs/common';
import {
  DiscoveryService,
  MetadataScanner,
  ModuleRef,
  createContextId,
} from '@nestjs/core';
import { Injector } from '@nestjs/core/injector/injector';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { Worker } from '@temporalio/worker';
import { ActivityInterface } from '@temporalio/activity';
import { join } from 'path';

@Injectable()
export class TemporalService implements OnModuleInit {
  private readonly injector = new Injector();

  constructor(
    private readonly moduleRef: ModuleRef,
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TemporalMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  onModuleInit() {
    this.run();
  }

  async run() {
    // `providers` represent all activities
    const activities: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter((wrapper: InstanceWrapper) =>
        this.metadataAccessor.isActivities(
          !wrapper.metatype || wrapper.inject
            ? wrapper.instance?.constructor
            : wrapper.metatype,
        ),
      );

    const activitiesFunc: ActivityInterface = {};

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
              const contextId = createContextId();

              if (this.moduleRef.registerRequestByContextId) {
                const activityRef = args[0];
                this.moduleRef.registerRequestByContextId(
                  activityRef,
                  contextId,
                );
              }

              const contextInstance = await this.injector.loadPerContext(
                instance,
                wrapper.host,
                wrapper.host.providers,
                contextId,
              );

              const callback = contextInstance[key].call(
                contextInstance,
                ...args,
              );
            } else {
              activitiesFunc[key] = instance[key].bind(instance);
            }
          }
        },
      );
    });

    const worker = await Worker.create({
      taskQueue: 'default',
      activities: activitiesFunc,
      workflowsPath: join(__dirname + '/src/temporal/workflow'),
    });

    await worker.run();
  }
}
