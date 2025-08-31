import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { WorkflowClientOptions } from '@temporalio/client';

export interface SharedWorkflowClientOptionsFactory {
  createSharedConfiguration():
    | Promise<WorkflowClientOptions>
    | WorkflowClientOptions;
}

export interface SharedWorkflowClientOptions
  extends Pick<ModuleMetadata, 'imports'> {
  name?: string;
  /**
   * Existing Provider to be used.
   */
  useExisting?: Type<SharedWorkflowClientOptionsFactory>;
  /**
   * Type (class name) of provider (instance to be registered and injected).
   */
  useClass?: Type<SharedWorkflowClientOptionsFactory>;
  /**
   * Factory function that returns an instance of the provider to be injected.
   */
  useFactory?: (
    ...args: any[]
  ) => Promise<WorkflowClientOptions> | WorkflowClientOptions;
  /**
   * Instance of a provider to be injected.
   */
  useValue?: WorkflowClientOptions;
  /**
   * Optional list of providers to be injected into the context of the Factory function.
   */
  inject?: FactoryProvider['inject'];
}
