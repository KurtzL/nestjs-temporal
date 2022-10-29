import { Provider } from '@nestjs/common';
import { Connection, WorkflowClient } from '@temporalio/client';

import { TemporalModuleOptions } from './interfaces';
import { getQueueToken, getWorkflowClient } from './utils';

export async function buildClient(
  option: TemporalModuleOptions,
): Promise<WorkflowClient> {
  const connection = await Connection.connect(option.connection);
  return getWorkflowClient({
    ...option.workflowOptions,
    connection,
  });
}

export function createClientProviders(
  options: TemporalModuleOptions[],
): Provider[] {
  return options.map((option) => ({
    provide: getQueueToken(option?.name || undefined),
    useFactory: async () => {
      return buildClient(option || {});
    },
  }));
}
