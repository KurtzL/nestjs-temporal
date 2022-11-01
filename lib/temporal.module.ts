import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import {
  NativeConnectionOptions,
  WorkerOptions,
  RuntimeOptions,
} from '@temporalio/worker';

import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { TemporalExplorer } from './temporal.explorer';
import {
  SharedWorkerAsyncConfiguration,
  TemporalModuleOptions,
  SharedRuntimeAsyncConfiguration,
  SharedConnectionAsyncConfiguration,
  SharedWorkflowClientOptions,
} from './interfaces';
import {
  TEMPORAL_CORE_CONFIG,
  TEMPORAL_WORKER_CONFIG,
  TEMPORAL_CONNECTION_CONFIG,
} from './temporal.constants';
import { createClientProviders } from './temporal.providers';
import { createAsyncProvider, createClientAsyncProvider } from './utils';

@Module({})
export class TemporalModule {
  static forRoot(
    workerConfig: WorkerOptions,
    connectionConfig?: NativeConnectionOptions,
    runtimeConfig?: RuntimeOptions,
  ): DynamicModule {
    const workerConfigProvider: Provider = {
      provide: TEMPORAL_WORKER_CONFIG,
      useValue: workerConfig || null,
    };

    const connectionConfigProvider: Provider = {
      provide: TEMPORAL_CONNECTION_CONFIG,
      useValue: connectionConfig || null,
    };

    const runtimeConfigProvider: Provider = {
      provide: TEMPORAL_CORE_CONFIG,
      useValue: runtimeConfig || null,
    };

    const providers: Provider[] = [
      workerConfigProvider,
      connectionConfigProvider,
      runtimeConfigProvider,
    ];

    return {
      global: true,
      module: TemporalModule,
      providers,
      imports: [TemporalModule.registerCore()],
    };
  }

  static forRootAsync(
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
    asyncConnectionConfig?: SharedConnectionAsyncConfiguration,
    asyncRuntimeConfig?: SharedRuntimeAsyncConfiguration,
  ): DynamicModule {
    const providers: Provider[] = [
      createAsyncProvider(TEMPORAL_WORKER_CONFIG, asyncWorkerConfig),
      createAsyncProvider(
        TEMPORAL_CONNECTION_CONFIG,
        asyncConnectionConfig,
      ),
      createAsyncProvider(TEMPORAL_CORE_CONFIG, asyncRuntimeConfig),
    ];

    return {
      global: true,
      module: TemporalModule,
      providers: [...providers],
      imports: [TemporalModule.registerCore()],
      exports: providers,
    };
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
    asyncSharedWorkflowClientOptions: SharedWorkflowClientOptions
  ): DynamicModule {
    const providers = createClientAsyncProvider(asyncSharedWorkflowClientOptions);

    return {
      global: true,
      module: TemporalModule,
      providers,
      exports: providers,
    };
  }

  private static registerCore() {
    return {
      global: true,
      module: TemporalModule,
      imports: [DiscoveryModule],
      providers: [TemporalExplorer, TemporalMetadataAccessor],
    };
  }
}
