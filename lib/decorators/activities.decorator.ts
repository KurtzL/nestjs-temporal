import { Scope, SetMetadata } from '@nestjs/common';
import { SCOPE_OPTIONS_METADATA } from '@nestjs/common/constants';
import { ActivityOptions } from '@temporalio/workflow';

import { TEMPORAL_MODULE_ACTIVITIES } from '../temporal.constants';

/**
 * Options for the @Activities() decorator.
 */
export interface ActivitiesOptions extends ActivityOptions {
  /**
   * Specifies the name of the queue to subscribe to.
   */
  name?: string;
  /**
   * Specifies the lifetime of an injected Activities class.
   */
  scope?: Scope;
}

/**
 * Marks a class as containing Temporal activities.
 * Methods within this class decorated with @Activity() will be registered as Temporal activities.
 *
 * @param queueNameOrOptions - Optional queue name (string) or options object
 * @returns Class decorator
 *
 * @example
 * ```typescript
 * @Injectable()
 * @Activities()
 * export class MyActivities {
 *   @Activity()
 *   async doSomething() { }
 * }
 * ```
 */
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
