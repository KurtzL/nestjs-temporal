import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { NativeConnectionOptions } from '@temporalio/worker';

export interface SharedConnectionConfigurationFactory {
  createSharedConfiguration(): Promise<NativeConnectionOptions> | NativeConnectionOptions;
}

export interface SharedConnectionAsyncConfiguration
  extends Pick<ModuleMetadata, 'imports'> {
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SharedConnectionConfigurationFactory>;
  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<SharedConnectionConfigurationFactory>;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (...args: any[]) => Promise<NativeConnectionOptions> | NativeConnectionOptions;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
