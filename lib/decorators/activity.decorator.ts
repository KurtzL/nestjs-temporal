import { SetMetadata } from '@nestjs/common';
import { TEMPORAL_MODULE_ACTIVITY } from '../temporal.constants';

export interface ActivityOptions {
  name?: string;
}

export function Activity(): MethodDecorator;
export function Activity(name: string): MethodDecorator;
export function Activity(options: ActivityOptions): MethodDecorator;
export function Activity(
  nameOrOptions?: string | ActivityOptions,
): MethodDecorator {
  const options =
    nameOrOptions && typeof nameOrOptions === 'object'
      ? nameOrOptions
      : { name: nameOrOptions };
  return SetMetadata(TEMPORAL_MODULE_ACTIVITY, options || {});
}
