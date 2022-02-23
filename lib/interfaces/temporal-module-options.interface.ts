import { ConnectionOptions, WorkflowClientOptions } from '@temporalio/client';

export interface TemporalModuleOptions {
  name?: string;
  connection?: ConnectionOptions;
  workflowOptions?: WorkflowClientOptions;
}
