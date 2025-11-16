import { OnApplicationShutdown } from '@nestjs/common';
import { WorkflowClient, WorkflowClientOptions } from '@temporalio/client';

/**
 * Assigns an application shutdown hook to a WorkflowClient to ensure
 * the connection is properly closed when the application shuts down.
 *
 * @param client - The WorkflowClient instance
 * @returns The client with shutdown hook assigned
 */
export function assignOnAppShutdownHook(
  client: WorkflowClient,
): WorkflowClient {
  (client as unknown as OnApplicationShutdown).onApplicationShutdown =
    async () => {
      try {
        await client.connection?.close();
      } catch (reason: unknown) {
        const errorMessage =
          reason instanceof Error ? reason.message : String(reason);
        console.error(
          `Temporal client connection was not cleanly closed: ${errorMessage}`,
        );
      }
    };
  return client;
}

/**
 * Creates a new WorkflowClient instance with application shutdown hook.
 *
 * @param options - Optional WorkflowClient configuration options
 * @returns A WorkflowClient instance with shutdown hook
 */
export function getWorkflowClient(
  options?: WorkflowClientOptions,
): WorkflowClient {
  const client = new WorkflowClient(options);
  return assignOnAppShutdownHook(client);
}
