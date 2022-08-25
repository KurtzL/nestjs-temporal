"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var TemporalModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const temporal_metadata_accessors_1 = require("./temporal-metadata.accessors");
const temporal_explorer_1 = require("./temporal.explorer");
const temporal_constants_1 = require("./temporal.constants");
const temporal_providers_1 = require("./temporal.providers");
let TemporalModule = TemporalModule_1 = class TemporalModule {
    static forRoot(workerConfig, nativeConnectionConfig) {
        const workerConfigProvider = {
            provide: temporal_constants_1.TEMPORAL_WORKER_CONFIG,
            useValue: workerConfig,
        };
        const nativeConnectionConfigProvider = {
            provide: temporal_constants_1.TEMPORAL_NATIVE_CONNECTION_CONFIG,
            useValue: nativeConnectionConfig || {},
        };
        return {
            global: true,
            module: TemporalModule_1,
            providers: [workerConfigProvider, nativeConnectionConfigProvider],
            imports: [TemporalModule_1.registerWorker()],
        };
    }
    static forRootAsync(asyncWorkerConfig, asyncNativeConnectionConfig) {
        const providers = [this.createAsyncProvider(asyncWorkerConfig)];
        const nativeConnectionConfigProvider = {
            provide: temporal_constants_1.TEMPORAL_NATIVE_CONNECTION_CONFIG,
            useValue: asyncNativeConnectionConfig || {},
        };
        return {
            global: true,
            module: TemporalModule_1,
            providers: [...providers, nativeConnectionConfigProvider],
            imports: [TemporalModule_1.registerWorker()],
            exports: providers,
        };
    }
    static createAsyncProvider(options) {
        if (options.useFactory) {
            return {
                provide: temporal_constants_1.TEMPORAL_WORKER_CONFIG,
                useFactory: options.useFactory,
                inject: options.inject || [],
            };
        }
    }
    static registerClient(options) {
        const realOptions = [].concat(options);
        const createClientProvider = (0, temporal_providers_1.createClientProviders)(realOptions);
        return {
            global: true,
            module: TemporalModule_1,
            providers: createClientProvider,
            exports: createClientProvider,
        };
    }
    static registerClientAsync(options) {
        throw new Error('Method not implemented.');
    }
    static registerWorker() {
        return {
            global: true,
            module: TemporalModule_1,
            imports: [core_1.DiscoveryModule],
            providers: [temporal_explorer_1.TemporalExplorer, temporal_metadata_accessors_1.TemporalMetadataAccessor],
        };
    }
};
TemporalModule = TemporalModule_1 = __decorate([
    (0, common_1.Module)({})
], TemporalModule);
exports.TemporalModule = TemporalModule;
