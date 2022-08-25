import { OnApplicationShutdown, Provider } from '@nestjs/common';
import { TemporalModuleOptions } from './interfaces';
import { Connection, WorkflowClient } from '@temporalio/client';
import { getQueueToken } from './utils';

export function buildClient(option: TemporalModuleOptions): WorkflowClient {
  const connection = Connection.lazy(option.connection);
  const client = new WorkflowClient({
    ...option.workflowOptions,
    connection,
  });

  (connection as any as OnApplicationShutdown).onApplicationShutdown = async function (
    this: Connection,
  ) {
    return await this.close();
  };

  return client;
}

export function createClientProviders(
  options: TemporalModuleOptions[],
): Provider[] {
  return options.map((option) => ({
    provide: getQueueToken(option && option.name ? option.name : undefined),
    useFactory: () => {
      return buildClient(option || {});
    },
  }));
}
