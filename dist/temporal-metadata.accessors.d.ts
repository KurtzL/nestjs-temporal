import { Type } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
export declare class TemporalMetadataAccessor {
    private readonly reflector;
    constructor(reflector: Reflector);
    isActivities(target: Type<any> | Function): boolean;
    getActivities(target: Type<any> | Function): any;
    isActivity(target: Type<any> | Function): boolean;
    getActivity(target: Type<any> | Function): any;
    isWorkflows(target: Type<any> | Function): boolean;
    getWorkflows(target: Type<any> | Function): any;
    isWorkflowMethod(target: Type<any> | Function): boolean;
    getWorkflowMethod(target: Type<any> | Function): any;
}
