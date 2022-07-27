import { Scope } from '@nestjs/common';
import { ActivityOptions } from '@temporalio/workflow';
export interface ActivitiesOptions extends ActivityOptions {
    name?: string;
    scope?: Scope;
}
export declare function Activities(): ClassDecorator;
export declare function Activities(queueName: string): ClassDecorator;
export declare function Activities(activitiesOptions: ActivitiesOptions): ClassDecorator;
