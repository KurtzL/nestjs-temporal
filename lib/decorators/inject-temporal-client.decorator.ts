import { Inject } from '@nestjs/common';

import { getQueueToken } from '../utils';

export const InjectTemporalClient = (name?: string): ParameterDecorator =>
  Inject(getQueueToken(name));
