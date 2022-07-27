import { Scope } from '@nestjs/common';
export interface WorkflowsOptions {
    name?: string;
    scope?: Scope;
}
export declare function Workflows(): ClassDecorator;
export declare function Workflows(name: string): ClassDecorator;
export declare function Workflows(options: WorkflowsOptions): ClassDecorator;
