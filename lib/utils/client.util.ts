import { OnApplicationShutdown } from '@nestjs/common';
import { Client, ClientOptions } from '@temporalio/client';

export function assignOnAppShutdownHook(client: Client) {
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

export function getClient(options?: ClientOptions) {
  const client = new Client(options);
  return assignOnAppShutdownHook(client);
}

