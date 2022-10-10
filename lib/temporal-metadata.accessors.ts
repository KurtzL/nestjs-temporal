import { Injectable, Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import {
  TEMPORAL_MODULE_ACTIVITIES,
  TEMPORAL_MODULE_ACTIVITY,
  TEMPORAL_MODULE_WORKFLOW,
  TEMPORAL_MODULE_WORKFLOW_METHOD,
} from './temporal.constants';

@Injectable()
export class TemporalMetadataAccessor {
  constructor(private readonly reflector: Reflector) {}

  isActivities(target: Type<any> | Function): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_ACTIVITIES, target);
  }

  getActivities(target: Type<any> | Function): any {
    return this.reflector.get(TEMPORAL_MODULE_ACTIVITIES, target);
  }

  isActivity(target: Type<any> | Function): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_ACTIVITY, target);
  }

  getActivity(target: Type<any> | Function): any {
    return this.reflector.get(TEMPORAL_MODULE_ACTIVITY, target);
  }

  isWorkflows(target: Type<any> | Function): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_WORKFLOW, target);
  }

  getWorkflows(target: Type<any> | Function): any {
    return this.reflector.get(TEMPORAL_MODULE_WORKFLOW, target);
  }

  isWorkflowMethod(target: Type<any> | Function): boolean {
    if (!target) return false;
    return !!this.reflector.get(TEMPORAL_MODULE_WORKFLOW_METHOD, target);
  }

  getWorkflowMethod(target: Type<any> | Function): any {
    return this.reflector.get(TEMPORAL_MODULE_WORKFLOW_METHOD, target);
  }
}
