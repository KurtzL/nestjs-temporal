import { DynamicModule } from '@nestjs/common';
import { SharedWorkerAsyncConfiguration, TemporalModuleOptions } from './interfaces';
import { WorkerOptions, NativeConnectionOptions } from '@temporalio/worker';
export declare class TemporalModule {
    static forRoot(workerConfig: WorkerOptions, nativeConnectionConfig?: NativeConnectionOptions): DynamicModule;
    static forRootAsync(asyncWorkerConfig: SharedWorkerAsyncConfiguration, asyncNativeConnectionConfig?: NativeConnectionOptions): DynamicModule;
    private static createAsyncProvider;
    static registerClient(options?: TemporalModuleOptions): DynamicModule;
    static registerClientAsync(options: TemporalModuleOptions): DynamicModule;
    private static registerWorker;
}
