import { OnApplicationBootstrap, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { TemporalMetadataAccessor } from './temporal-metadata.accessors';
import { WorkerOptions, NativeConnectionOptions } from '@temporalio/worker';
import { UntypedActivities } from '@temporalio/activity';
export declare class TemporalExplorer implements OnModuleInit, OnModuleDestroy, OnApplicationBootstrap {
    private readonly moduleRef;
    private readonly discoveryService;
    private readonly metadataAccessor;
    private readonly metadataScanner;
    private readonly injector;
    private worker;
    constructor(moduleRef: ModuleRef, discoveryService: DiscoveryService, metadataAccessor: TemporalMetadataAccessor, metadataScanner: MetadataScanner);
    onModuleInit(): Promise<void>;
    onModuleDestroy(): void;
    onApplicationBootstrap(): void;
    explore(): Promise<void>;
    getWorkerConfigOptions(name?: string): WorkerOptions;
    getNativeConnectionConfigOptions(name?: string): NativeConnectionOptions;
    handleActivities(): Promise<UntypedActivities>;
}