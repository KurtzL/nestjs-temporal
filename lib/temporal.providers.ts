import { OnApplicationShutdown, Provider } from '@nestjs/common';
import { Connection, WorkflowClient } from '@temporalio/client';

import { TemporalModuleOptions } from './interfaces';
import { getQueueToken } from './utils';

export async function buildClient(
  option: TemporalModuleOptions,
): Promise<WorkflowClient> {
  const connection = await Connection.connect(option.connection);
  const client = new WorkflowClient({
    ...option.workflowOptions,
    connection,
  });

  (connection as any as OnApplicationShutdown).onApplicationShutdown =
    function (this: Connection) {
      return this.client.close();
    };

  return client;
}

export function createClientProviders(
  options: TemporalModuleOptions[],
): Provider[] {
  return options.map((option) => ({
    provide: getQueueToken(option && option.name ? option.name : undefined),
    useFactory: async () => {
      return buildClient(option || {});
    },
  }));
}
