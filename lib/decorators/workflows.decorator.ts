import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';

import { TEMPORAL_MODULE_WORKFLOW } from '../temporal.constants';

export interface WorkflowsOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  name?: string;
  /**
   * Specifies the lifetime of an injected Processor.
   */
  scope?: Scope;
}

export function Workflows(): ClassDecorator;
export function Workflows(name: string): ClassDecorator;
export function Workflows(options: WorkflowsOptions): ClassDecorator;
export function Workflows(
  nameOrOptions?: string | WorkflowsOptions,
): ClassDecorator {
  const options =
    nameOrOptions && typeof nameOrOptions === 'object'
      ? nameOrOptions
      : { name: nameOrOptions };
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(TEMPORAL_MODULE_WORKFLOW, options)(target);
  };
}
