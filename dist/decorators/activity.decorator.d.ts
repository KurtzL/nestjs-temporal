export interface ActivityOptions {
    name?: string;
}
export declare function Activity(): MethodDecorator;
export declare function Activity(name: string): MethodDecorator;
export declare function Activity(options: ActivityOptions): MethodDecorator;
