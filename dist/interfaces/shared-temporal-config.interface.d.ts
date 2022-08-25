import { FactoryProvider, ModuleMetadata, Type } from '@nestjs/common';
import { WorkerOptions } from '@temporalio/worker';
export interface SharedWorkerConfigurationFactory {
    createSharedConfiguration(): Promise<WorkerOptions> | WorkerOptions;
}
export interface SharedWorkerAsyncConfiguration extends Pick<ModuleMetadata, 'imports'> {
    useExisting?: Type<SharedWorkerConfigurationFactory>;
    useClass?: Type<SharedWorkerConfigurationFactory>;
    useFactory?: (...args: any[]) => Promise<WorkerOptions> | WorkerOptions;
    inject?: FactoryProvider['inject'];
}
