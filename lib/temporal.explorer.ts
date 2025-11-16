import {
  Inject,
  Injectable,
  Logger,
  OnApplicationBootstrap,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
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
  TEMPORAL_MODULE_OPTIONS_TOKEN,
  TemporalModuleOptions,
} from './temporal.module-definition';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';

/**
 * TemporalExplorer is responsible for discovering and registering Temporal activities
 * and creating the Temporal worker instance.
 *
 * It scans the NestJS application for classes decorated with @Activities() and methods
 * decorated with @Activity(), then registers them with the Temporal worker.
 */
@Injectable()
export class TemporalExplorer
  implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap
{
  @Inject(TEMPORAL_MODULE_OPTIONS_TOKEN)
  private readonly options: TemporalModuleOptions;
  private readonly logger = new Logger(TemporalExplorer.name);
  private worker?: Worker;
  private workerRunPromise?: Promise<void>;

  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataAccessor: TemporalMetadataAccessor,
    private readonly metadataScanner: MetadataScanner,
  ) {}

  /**
   * Initializes the module by exploring and setting up the Temporal worker.
   */
  async onModuleInit(): Promise<void> {
    await this.explore();
  }

  /**
   * Shuts down the Temporal worker when the module is destroyed.
   */
  async onModuleDestroy(): Promise<void> {
    if (!this.worker) {
      return;
    }

    try {
      this.worker.shutdown();
      if (this.workerRunPromise) {
        await this.workerRunPromise;
      }
    } catch (err: unknown) {
      this.logger.warn('Temporal worker was not cleanly shutdown.', {
        err: err instanceof Error ? err.message : String(err),
      });
    }
  }

  /**
   * Starts the Temporal worker when the application is fully bootstrapped.
   */
  onApplicationBootstrap(): void {
    if (this.worker) {
      this.workerRunPromise = this.worker.run();
    }
  }

  /**
   * Explores the application for Temporal activities and creates the worker.
   * This method is called during module initialization.
   */
  async explore(): Promise<void> {
    const workerConfig = this.getWorkerConfigOptions();
    const runTimeOptions = this.getRuntimeOptions();
    const connectionOptions = this.getNativeConnectionOptions();

    // Worker must have a taskQueue configured
    if (!workerConfig.taskQueue) {
      this.logger.warn(
        'Temporal worker configuration missing taskQueue. Worker will not be created.',
      );
      return;
    }

    this.findDuplicateActivityMethods();

    const activitiesFunc = await this.handleActivities();

    if (runTimeOptions) {
      this.logger.verbose('Instantiating a new Runtime object');
      Runtime.install(runTimeOptions);
    }

    const workerOptions: Partial<WorkerOptions> = {
      activities: activitiesFunc,
    };

    if (connectionOptions) {
      this.logger.verbose('Connecting to the Temporal server');
      workerOptions.connection =
        await NativeConnection.connect(connectionOptions);
    }

    this.logger.verbose('Creating a new Worker');
    this.worker = await Worker.create({
      ...workerConfig,
      ...workerOptions,
    } as WorkerOptions);
  }

  /**
   * Gets the worker configuration options.
   */
  getWorkerConfigOptions(): WorkerOptions {
    return this.options.workerOptions;
  }

  /**
   * Gets the native connection options for the Temporal server.
   */
  getNativeConnectionOptions(): NativeConnectionOptions | undefined {
    return this.options.connectionOptions;
  }

  /**
   * Gets the runtime options for the Temporal worker.
   */
  getRuntimeOptions(): RuntimeOptions | undefined {
    return this.options.runtimeOptions;
  }

  /**
   * Gets the activity classes to register with this worker.
   * If undefined, all discovered activities will be registered.
   * Can be either class constructors or InstanceWrappers.
   */
  private getActivityClasses(): (InstanceWrapper | Function)[] | undefined {
    return this.options.activityClasses as
      | (InstanceWrapper | Function)[]
      | undefined;
  }

  /**
   * Validates that activity method names are unique across all activity classes.
   * Throws an error if duplicates are found and errorOnDuplicateActivities is enabled.
   */
  findDuplicateActivityMethods(): void {
    if (!this.options.errorOnDuplicateActivities) {
      return;
    }

    const activityClasses = this.getActivityClasses();
    if (!activityClasses || activityClasses.length === 0) {
      return;
    }

    const activityMethods: Record<string, string[]> = {};

    activityClasses.forEach((classOrWrapper: InstanceWrapper | Function) => {
      // Handle both InstanceWrapper and class constructor
      const wrapper = classOrWrapper as InstanceWrapper;
      const instance =
        'instance' in wrapper && wrapper.instance
          ? wrapper.instance
          : new (classOrWrapper as new () => unknown)();

      this.metadataScanner
        .getAllMethodNames(Object.getPrototypeOf(instance))
        .forEach((key) => {
          if (this.metadataAccessor.isActivity(instance[key])) {
            activityMethods[key] = (activityMethods[key] || []).concat(
              instance.constructor.name,
            );
          }
        });
    });

    const violations = Object.entries(activityMethods).filter(
      ([, classes]) => classes.length > 1,
    );

    if (violations.length > 0) {
      const message = `Activity names must be unique across all Activity classes. Identified activities with conflicting names: ${JSON.stringify(
        Object.fromEntries(violations),
      )}`;
      this.logger.error(message);
      throw new Error(message);
    }
  }

  /**
   * Discovers and binds all activity methods from classes decorated with @Activities().
   * Returns an object mapping activity method names to their bound implementations.
   */
  async handleActivities(): Promise<Record<string, Function>> {
    const activitiesMethod: Record<string, Function> = {};

    const activityClasses = this.getActivityClasses();
    const activities: InstanceWrapper[] = this.discoveryService
      .getProviders()
      .filter(
        (wrapper: InstanceWrapper) =>
          this.metadataAccessor.isActivities(
            !wrapper.metatype || wrapper.inject
              ? wrapper.instance?.constructor
              : wrapper.metatype,
          ) &&
          (!activityClasses ||
            activityClasses.some(
              (cls) =>
                cls === wrapper.metatype ||
                (cls instanceof Object &&
                  'metatype' in cls &&
                  (cls as InstanceWrapper).metatype === wrapper.metatype),
            )),
      );

    activities.forEach((wrapper: InstanceWrapper) => {
      const { instance } = wrapper;
      const isRequestScoped = !wrapper.isDependencyTreeStatic();

      this.metadataScanner.scanFromPrototype(
        instance,
        Object.getPrototypeOf(instance),
        (key: string) => {
          if (this.metadataAccessor.isActivity(instance[key])) {
            if (isRequestScoped) {
              this.logger.warn(
                `Request-scoped activities are not yet fully supported. Activity "${key}" from class "${instance.constructor.name}" may not work correctly.`,
              );
            }
            activitiesMethod[key] = instance[key].bind(instance);
          }
        },
      );
    });

    return activitiesMethod;
  }
}
