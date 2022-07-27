import { Provider } from '@nestjs/common';
import { TemporalModuleOptions } from './interfaces';
import { WorkflowClient } from '@temporalio/client';
export declare function buildClient(option: TemporalModuleOptions): WorkflowClient;
export declare function createClientProviders(options: TemporalModuleOptions[]): Provider[];
