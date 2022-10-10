import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { ActivityOptions } from '@temporalio/workflow';

import { TEMPORAL_MODULE_ACTIVITIES } from '../temporal.constants';

export interface ActivitiesOptions extends ActivityOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  name?: string;
  /**
   * Specifies the lifetime of an injected Activities.
   */
  scope?: Scope;
}

export function Activities(): ClassDecorator;
export function Activities(queueName: string): ClassDecorator;
export function Activities(
  activitiesOptions: ActivitiesOptions,
): ClassDecorator;
export function Activities(
  queueNameOrOptions?: string | ActivitiesOptions,
): ClassDecorator {
  const options =
    queueNameOrOptions && typeof queueNameOrOptions === 'object'
      ? queueNameOrOptions
      : { name: queueNameOrOptions };
  return (target: Function) => {
    SetMetadata(SCOPE_OPTIONS_METADATA, options)(target);
    SetMetadata(TEMPORAL_MODULE_ACTIVITIES, options)(target);
  };
}
