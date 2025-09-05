import {
  NativeConnectionOptions,
  RuntimeOptions,
  WorkerOptions,
} from '@temporalio/worker';
import { ConfigurableModuleBuilder } from '@nestjs/common';

export interface TemporalModuleOptions {
  workerOptions: WorkerOptions;
  connectionOptions?: NativeConnectionOptions;
  runtimeOptions?: RuntimeOptions;
  activityClasses?: object[];
  errorOnDuplicateActivities?: boolean;
}

export const {
  ConfigurableModuleClass,
  MODULE_OPTIONS_TOKEN: TEMPORAL_MODULE_OPTIONS_TOKEN,
  OPTIONS_TYPE: TEMPORAL_MODULE_OPTIONS_TYPE,
  ASYNC_OPTIONS_TYPE: TEMPORAL_MODULE_ASYNC_OPTIONS_TYPE,
} = new ConfigurableModuleBuilder<TemporalModuleOptions>()
  .setClassMethodName('registerWorker')
  .build();
