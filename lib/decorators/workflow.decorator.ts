import { SetMetadata } from '@nestjs/common';

import { TEMPORAL_MODULE_WORKFLOW_METHOD } from '../temporal.constants';

export interface WorkflowMethodOptions {
  name?: string;
}

export function WorkflowMethod(): MethodDecorator;
export function WorkflowMethod(name: string): MethodDecorator;
export function WorkflowMethod(options: WorkflowMethodOptions): MethodDecorator;
export function WorkflowMethod(
  nameOrOptions?: string | WorkflowMethodOptions,
): MethodDecorator {
  const options =
    nameOrOptions && typeof nameOrOptions === 'object'
      ? nameOrOptions
      : { name: nameOrOptions };

  return SetMetadata(TEMPORAL_MODULE_WORKFLOW_METHOD, options || {});
}
