import { DynamicModule, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';

import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { TemporalExplorer } from './temporal.explorer';
import {
  SharedWorkflowClientOptions,
  TemporalModuleOptions,
} from './interfaces';
import { createClientProviders } from './temporal.providers';
import { createClientAsyncProvider } from './utils';
import {
  ConfigurableModuleClass,
  TEMPORAL_MODULE_ASYNC_OPTIONS_TYPE,
  TEMPORAL_MODULE_OPTIONS_TYPE,
} from './temporal.module-definition';

/**
 * TemporalModule provides integration between NestJS and Temporal workflow orchestration.
 *
 * Use registerWorker() or registerWorkerAsync() to register Temporal workers that execute activities.
 * Use registerClient() or registerClientAsync() to register Temporal clients for starting workflows.
 */
@Module({})
export class TemporalModule extends ConfigurableModuleClass {
  /**
   * Create a new Temporal worker.
   *
   * @deprecated Use registerWorker instead.
   * @param options - Worker configuration options
   * @returns Dynamic module configuration
   */
  static forRoot(options: typeof TEMPORAL_MODULE_OPTIONS_TYPE): DynamicModule {
    return TemporalModule.registerWorker(options);
  }

  /**
   * Create a new Temporal worker asynchronously.
   *
   * @deprecated Use registerWorkerAsync instead.
   * @param options - Async worker configuration options
   * @returns Dynamic module configuration
   */
  static forRootAsync(
    options: typeof TEMPORAL_MODULE_ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    return TemporalModule.registerWorkerAsync(options);
  }

  /**
   * Registers a Temporal worker synchronously.
   * The worker will discover and register all activities decorated with @Activities() and @Activity().
   *
   * @param options - Worker configuration options
   * @returns Dynamic module configuration
   */
  static registerWorker(
    options: typeof TEMPORAL_MODULE_OPTIONS_TYPE,
  ): DynamicModule {
    const superDynamicModule = super.registerWorker(options);
    superDynamicModule.imports = [DiscoveryModule];
    superDynamicModule.providers.push(
      TemporalExplorer,
      TemporalMetadataAccessor,
    );
    return superDynamicModule;
  }

  /**
   * Registers a Temporal worker asynchronously.
   * Useful when configuration depends on other async providers (e.g., ConfigService).
   *
   * @param options - Async worker configuration options
   * @returns Dynamic module configuration
   */
  static registerWorkerAsync(
    options: typeof TEMPORAL_MODULE_ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    const superDynamicModule = super.registerWorkerAsync(options);
    superDynamicModule.imports.push(DiscoveryModule);
    superDynamicModule.providers.push(
      TemporalExplorer,
      TemporalMetadataAccessor,
    );
    return superDynamicModule;
  }

  /**
   * Registers a Temporal WorkflowClient synchronously.
   * The client can be injected using @InjectTemporalClient() decorator.
   *
   * @param options - Client configuration options (optional)
   * @returns Dynamic module configuration
   */
  static registerClient(options?: TemporalModuleOptions): DynamicModule {
    const createClientProvider = createClientProviders([].concat(options));
    return {
      global: true,
      module: TemporalModule,
      providers: createClientProvider,
      exports: createClientProvider,
    };
  }
  /**
   * Registers a Temporal WorkflowClient asynchronously.
   * Useful when configuration depends on other async providers (e.g., ConfigService).
   *
   * @param asyncSharedWorkflowClientOptions - Async client configuration options
   * @returns Dynamic module configuration
   */
  static registerClientAsync(
    asyncSharedWorkflowClientOptions: SharedWorkflowClientOptions,
  ): DynamicModule {
    const providers = createClientAsyncProvider(
      asyncSharedWorkflowClientOptions,
    );

    return {
      global: true,
      module: TemporalModule,
      providers,
      exports: providers,
    };
  }
}
