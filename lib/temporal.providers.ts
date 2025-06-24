import { Provider } from '@nestjs/common';
import { Connection, Client } from '@temporalio/client';

import { TemporalModuleOptions } from './interfaces';
import { getQueueToken, getClient } from './utils';

export async function buildClient(
  option: TemporalModuleOptions,
): Promise<Client> {
  const connection = await Connection.connect(option.connection);
  return getClient({
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
