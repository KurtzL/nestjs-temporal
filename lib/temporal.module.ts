import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { TemporalExplorer } from './temporal.explorer';
import {
  SharedWorkerAsyncConfiguration,
  TemporalModuleOptions,
} from './interfaces';
import { WorkerOptions, NativeConnectionOptions } from '@temporalio/worker';
import {
  TEMPORAL_NATIVE_CONNECTION_CONFIG,
  TEMPORAL_WORKER_CONFIG,
} from './temporal.constants';
import { createClientProviders } from './temporal.providers';

@Module({})
export class TemporalModule {
  static forRoot(
    workerConfig: WorkerOptions,
    nativeConnectionConfig?: NativeConnectionOptions,
  ): DynamicModule {

    const workerConfigProvider: Provider = {
      provide: TEMPORAL_WORKER_CONFIG,
      useValue: workerConfig,
    };

    const nativeConnectionConfigProvider: Provider = {
      provide: TEMPORAL_NATIVE_CONNECTION_CONFIG,
      useValue: nativeConnectionConfig || {},
    };

    return {
      global: true,
      module: TemporalModule,
      providers: [workerConfigProvider, nativeConnectionConfigProvider],
      imports: [TemporalModule.registerWorker()],
    };
  }

  static forRootAsync(
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
    asyncNativeConnectionConfig?: NativeConnectionOptions,
  ): DynamicModule {
    const providers: Provider[] = [this.createAsyncProvider(asyncWorkerConfig)];

    const nativeConnectionConfigProvider: Provider = {
      provide: TEMPORAL_NATIVE_CONNECTION_CONFIG,
      useValue: asyncNativeConnectionConfig || {},
    };

    return {
      global: true,
      module: TemporalModule,
      providers: [...providers, nativeConnectionConfigProvider],
      imports: [TemporalModule.registerWorker()],
      exports: providers,
    };
  }

  private static createAsyncProvider(
    options: SharedWorkerAsyncConfiguration,
  ): Provider {
    if (options.useFactory) {
      return {
        provide: TEMPORAL_WORKER_CONFIG,
        useFactory: options.useFactory,
        inject: options.inject || [],
      };
    }
  }

  static registerClient(options?: TemporalModuleOptions): DynamicModule {
    const realOptions = [].concat(options);
    const createClientProvider = createClientProviders(realOptions);
    return {
      global: true,
      module: TemporalModule,
      providers: createClientProvider,
      exports: createClientProvider,
    };
  }
  static registerClientAsync(options: TemporalModuleOptions): DynamicModule {
    throw new Error('Method not implemented.');
  }

  private static registerWorker() {
    return {
      global: true,
      module: TemporalModule,
      imports: [DiscoveryModule],
      providers: [TemporalExplorer, TemporalMetadataAccessor],
    };
  }
}
