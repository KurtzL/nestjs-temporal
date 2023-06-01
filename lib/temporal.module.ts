import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import {
  NativeConnectionOptions,
  RuntimeOptions,
  WorkerOptions,
} from '@temporalio/worker';

import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { TemporalExplorer } from './temporal.explorer';
import {
  SharedConnectionAsyncConfiguration,
  SharedRuntimeAsyncConfiguration,
  SharedWorkerAsyncConfiguration,
  SharedWorkflowClientOptions,
  TemporalModuleOptions,
} from './interfaces';
import {
  TEMPORAL_ACTIVITIES_MODULES,
  TEMPORAL_CONNECTION_CONFIG,
  TEMPORAL_CORE_CONFIG,
  TEMPORAL_WORKER_CONFIG,
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
    const providers = this.createConfigProviders(
      workerConfig,
      connectionConfig,
      runtimeConfig,
    );

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
    const providers: Provider[] = this.createAsyncConfigProviders(
      asyncWorkerConfig,
      asyncConnectionConfig,
      asyncRuntimeConfig,
    );

    return {
      global: true,
      module: TemporalModule,
      providers: [...providers],
      imports: [TemporalModule.registerCore()],
      exports: providers,
    };
  }

  /**
   * Register a single worker.
   *
   * This can be used multiple times to register multiple workers.
   */
  static registerWorker(
    workerConfig: WorkerOptions,
    activityModules: any[],
    connectionConfig?: NativeConnectionOptions,
    runtimeConfig?: RuntimeOptions,
  ): DynamicModule {
    const providers = this.createConfigProviders(
      workerConfig,
      connectionConfig,
      runtimeConfig,
    );
    const activitiesProvider: Provider = {
      provide: TEMPORAL_ACTIVITIES_MODULES,
      useValue: activityModules,
    };

    return {
      module: TemporalModule,
      providers: [
        ...providers,
        activitiesProvider,
        TemporalExplorer,
        TemporalMetadataAccessor,
      ],
      imports: [DiscoveryModule],
    };
  }

  /**
   * Register a single worker.
   *
   * This can be used multiple times to register multiple workers.
   */
  static registerWorkerAsync(
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
    activityModules: any[],
    asyncConnectionConfig?: SharedConnectionAsyncConfiguration,
    asyncRuntimeConfig?: SharedRuntimeAsyncConfiguration,
  ): DynamicModule {
    const providers: Provider[] = this.createAsyncConfigProviders(
      asyncWorkerConfig,
      asyncConnectionConfig,
      asyncRuntimeConfig,
    );
    const activitiesProvider: Provider = {
      provide: TEMPORAL_ACTIVITIES_MODULES,
      useValue: activityModules,
    };

    return {
      module: TemporalModule,
      providers: [
        ...providers,
        activitiesProvider,
        TemporalExplorer,
        TemporalMetadataAccessor,
      ],
      imports: [DiscoveryModule],
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

  protected static createConfigProviders(
    workerConfig: WorkerOptions,
    connectionConfig: NativeConnectionOptions,
    runtimeConfig: RuntimeOptions,
  ) {
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

    return [
      workerConfigProvider,
      connectionConfigProvider,
      runtimeConfigProvider,
    ];
  }

  protected static createAsyncConfigProviders(
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
    asyncConnectionConfig: SharedConnectionAsyncConfiguration,
    asyncRuntimeConfig: SharedRuntimeAsyncConfiguration,
  ) {
    return [
      createAsyncProvider(TEMPORAL_WORKER_CONFIG, asyncWorkerConfig),
      createAsyncProvider(TEMPORAL_CONNECTION_CONFIG, asyncConnectionConfig),
      createAsyncProvider(TEMPORAL_CORE_CONFIG, asyncRuntimeConfig),
    ];
  }

  private static registerCore(): DynamicModule {
    return {
      global: true,
      module: TemporalModule,
      imports: [DiscoveryModule],
      providers: [TemporalExplorer, TemporalMetadataAccessor],
    };
  }
}
