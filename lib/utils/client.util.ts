import { OnApplicationShutdown } from '@nestjs/common';
import { WorkflowClient, WorkflowClientOptions } from '@temporalio/client';

export function assignOnAppShutdownHook(client: WorkflowClient) {
  (client as unknown as OnApplicationShutdown).onApplicationShutdown =
    async () =>
      client.connection
        ?.close()
        .catch((reason) =>
          console.error(
            `Temporal client connection was not cleanly closed: ${reason}`,
          ),
        );
  return client;
}

export function getWorkflowClient(options?: WorkflowClientOptions) {
  const client = new WorkflowClient(options);
  return assignOnAppShutdownHook(client);
}
