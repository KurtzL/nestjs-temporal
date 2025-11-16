import { Inject } from '@nestjs/common';

import { getQueueToken } from '../utils';

/**
 * Injects a Temporal WorkflowClient instance.
 * Use this decorator to inject the client registered via TemporalModule.registerClient().
 *
 * @param name - Optional name of the client instance (for named clients)
 * @returns Parameter decorator for dependency injection
 *
 * @example
 * ```typescript
 * constructor(@InjectTemporalClient() private client: WorkflowClient) {}
 * ```
 */
export const InjectTemporalClient = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));
