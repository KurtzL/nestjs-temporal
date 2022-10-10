import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { WorkerOptions } from '@temporalio/worker';

export interface SharedWorkerConfigurationFactory {
  createSharedConfiguration(): Promise<WorkerOptions> | WorkerOptions;
}

export interface SharedWorkerAsyncConfiguration
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SharedWorkerConfigurationFactory>;
  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<SharedWorkerConfigurationFactory>;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (...args: any[]) => Promise<WorkerOptions> | WorkerOptions;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
