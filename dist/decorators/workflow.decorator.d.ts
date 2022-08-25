export interface WorkflowMethodOptions {
    name?: string;
}
export declare function WorkflowMethod(): MethodDecorator;
export declare function WorkflowMethod(name: string): MethodDecorator;
export declare function WorkflowMethod(options: WorkflowMethodOptions): MethodDecorator;
