import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { RuntimeOptions } from '@temporalio/worker';

export interface SharedRuntimeConfigurationFactory {
  createSharedConfiguration(): Promise<RuntimeOptions> | RuntimeOptions;
}

export interface SharedRuntimeAsyncConfiguration
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SharedRuntimeConfigurationFactory>;
  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<SharedRuntimeConfigurationFactory>;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (...args: any[]) => Promise<RuntimeOptions> | RuntimeOptions;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
