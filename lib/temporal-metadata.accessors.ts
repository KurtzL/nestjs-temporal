import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  TEMPORAL_MODULE_ACTIVITIES,
  TEMPORAL_MODULE_ACTIVITY,
  TEMPORAL_MODULE_WORKFLOW,
  TEMPORAL_MODULE_WORKFLOW_METHOD,
} from './temporal.constants';

/**
 * TemporalMetadataAccessor provides methods to check and retrieve Temporal decorator metadata.
 * It uses NestJS Reflector to access metadata set by @Activities(), @Activity(), @Workflows(), and @WorkflowMethod() decorators.
 */
@Injectable()
export class TemporalMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isActivities(target: Type<unknown> | Function | null | undefined): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_ACTIVITIES, target);
  }

  getActivities(target: Type<unknown> | Function): unknown {
    return this.reflector.get(TEMPORAL_MODULE_ACTIVITIES, target);
  }

  isActivity(target: Type<unknown> | Function | null | undefined): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_ACTIVITY, target);
  }

  getActivity(target: Type<unknown> | Function): unknown {
    return this.reflector.get(TEMPORAL_MODULE_ACTIVITY, target);
  }

  isWorkflows(target: Type<unknown> | Function | null | undefined): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_WORKFLOW, target);
  }

  getWorkflows(target: Type<unknown> | Function): unknown {
    return this.reflector.get(TEMPORAL_MODULE_WORKFLOW, target);
  }

  isWorkflowMethod(
    target: Type<unknown> | Function | null | undefined,
  ): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_WORKFLOW_METHOD, target);
  }

  getWorkflowMethod(target: Type<unknown> | Function): unknown {
    return this.reflector.get(TEMPORAL_MODULE_WORKFLOW_METHOD, target);
  }
}
