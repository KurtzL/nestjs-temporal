import { DynamicModule } from '@nestjs/common';
import { WorkerOptions } from '@temporalio/worker';

import { SharedWorkerAsyncConfiguration } from './shared-worker-config.interface';
import { TemporalModuleOptions } from './temporal-module-options.interface';

export interface ITemporalModule {
  forRoot(workerConfig: WorkerOptions): DynamicModule;
  forRoot(configKey: string, workerConfig: WorkerOptions): DynamicModule;
  forRoot(
    keyOrConfig: string | WorkerOptions,
    workerConfig: WorkerOptions,
  ): DynamicModule;

  forRootAsync(
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
  ): DynamicModule;
  forRootAsync(
    configKey: string,
    asyncWorkerConfig: SharedWorkerAsyncConfiguration,
  ): DynamicModule;
  forRootAsync(
    configKey: string | SharedWorkerAsyncConfiguration,
    asyncWorkerConfig?: SharedWorkerAsyncConfiguration,
  ): DynamicModule;

  registerClient(options: TemporalModuleOptions): DynamicModule;
  registerClientAsync(options: TemporalModuleOptions): DynamicModule;
}
