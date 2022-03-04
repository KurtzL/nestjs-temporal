import { DynamicModule, Module, Provider } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { TemporalExplorer } from './temporal.explorer';
import {
  SharedWorkerAsyncConfiguration,
  TemporalModuleOptions,
} from './interfaces';
import { WorkerOptions } from '@temporalio/worker';
import { TEMPORAL_WORKER_CONFIG } from './temporal.constants';
import { createClientProviders } from './temporal.providers';

@Module({})
export class TemporalModule {
  static forRoot(workerConfig: WorkerOptions): DynamicModule {
    const workerConfigProvider: Provider = {
      provide: TEMPORAL_WORKER_CONFIG,
      useValue: workerConfig,
    };
    return {
      global: true,
      module: TemporalModule,
      providers: [workerConfigProvider],
      imports: [TemporalModule.registerCore()],
    };
  }

  static forRootAsync(
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
  ): DynamicModule {
    const providers: Provider[] = [this.createAsyncProvider(asyncWorkerConfig)];

    return {
      global: true,
      module: TemporalModule,
      providers: providers,
      imports: [TemporalModule.registerCore()],
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
    const createClientProvider = createClientProviders([].concat(options));
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

  private static registerCore() {
    return {
      global: true,
      module: TemporalModule,
      imports: [DiscoveryModule],
      providers: [TemporalExplorer, TemporalMetadataAccessor],
    };
  }
}
