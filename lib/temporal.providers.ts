import { Provider } from '@nestjs/common';
import { Connection, WorkflowClient } from '@temporalio/client';

import { TemporalModuleOptions } from './interfaces';
import { getQueueToken, getWorkflowClient } from './utils';

/**
 * Builds a WorkflowClient from the provided options.
 * If connection options are provided, establishes a connection first.
 *
 * @param option - Temporal module options containing connection and workflow options
 * @returns A configured WorkflowClient instance
 */
export async function buildClient(
  option: TemporalModuleOptions,
): Promise<WorkflowClient> {
  if (option.connection) {
    const connection = await Connection.connect(option.connection);
    return getWorkflowClient({
      ...option.workflowOptions,
      connection,
    });
  }

  return getWorkflowClient(option.workflowOptions);
}

/**
 * Creates providers for Temporal WorkflowClients.
 * Each option in the array will create a separate client provider.
 *
 * @param options - Array of Temporal module options
 * @returns Array of NestJS providers for WorkflowClients
 */
export function createClientProviders(
  options: TemporalModuleOptions[],
): Provider[] {
  return options.map((option) => ({
    provide: getQueueToken(option?.name || undefined),
    useFactory: async (): Promise<WorkflowClient> => {
      return buildClient(option || {});
    },
  }));
}
