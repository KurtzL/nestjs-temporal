import { OnApplicationShutdown } from "@nestjs/common";
import { WorkflowClient, WorkflowClientOptions } from "@temporalio/client";

export function assignOnAppShutdownHook(client: WorkflowClient) {
  (client as unknown as OnApplicationShutdown).onApplicationShutdown = client.connection.close;
  return client;
}

export function getWorkflowClient(options?: WorkflowClientOptions) {
  const client = new WorkflowClient(options);
  return assignOnAppShutdownHook(client);
}