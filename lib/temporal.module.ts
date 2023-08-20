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

@Module({})
export class TemporalModule extends ConfigurableModuleClass {
  /**
   * Create a new Temporal worker.
   *
   * @deprecated Use registerWorker.
   */
  static forRoot(options: typeof TEMPORAL_MODULE_OPTIONS_TYPE): DynamicModule {
    return TemporalModule.registerWorker(options);
  }

  /**
   * Create a new Temporal worker.
   *
   * @deprecated Use registerWorker.
   */
  static forRootAsync(
    options: typeof TEMPORAL_MODULE_ASYNC_OPTIONS_TYPE,
  ): DynamicModule {
    return TemporalModule.registerWorkerAsync(options);
  }

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

  static registerClient(options?: TemporalModuleOptions): DynamicModule {
    const createClientProvider = createClientProviders([].concat(options));
    return {
      global: true,
      module: TemporalModule,
      providers: createClientProvider,
      exports: createClientProvider,
    };
  }
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
