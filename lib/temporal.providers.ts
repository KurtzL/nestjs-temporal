import { OnApplicationShutdown, Provider } from '@nestjs/common';
import { TemporalModuleOptions } from './interfaces';
import { TEMPORAL_CLIENT_CONFIG } from './temporal.constants';
import { Connection, WorkflowClient } from '@temporalio/client';

export function buildClient(option: TemporalModuleOptions): WorkflowClient {
  const connection = new Connection(option.connection || {});
  const client = new WorkflowClient(
    connection.service,
    option.workflowOptions || {},
  );

  (client as any as OnApplicationShutdown).onApplicationShutdown = function (
    this: Connection,
  ) {
    return this.client.close();
  };

  return client;
}

export function createClientProviders(
  options: TemporalModuleOptions[],
): Provider[] {
  return options.map((option) => ({
    provide: TEMPORAL_CLIENT_CONFIG,
    useFactory: (o: TemporalModuleOptions) => {
      const name = o.name || option.name;
      return buildClient({ ...o, name });
    },
    inject: [TEMPORAL_CLIENT_CONFIG],
  }));
}
