"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalExplorer = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const injector_1 = require("@nestjs/core/injector/injector");
const temporal_metadata_accessors_1 = require("./temporal-metadata.accessors");
const worker_1 = require("@temporalio/worker");
const temporal_constants_1 = require("./temporal.constants");
let TemporalExplorer = class TemporalExplorer {
    constructor(moduleRef, discoveryService, metadataAccessor, metadataScanner) {
        this.moduleRef = moduleRef;
        this.discoveryService = discoveryService;
        this.metadataAccessor = metadataAccessor;
        this.metadataScanner = metadataScanner;
        this.injector = new injector_1.Injector();
        this.workerPromises = [];
        this.workers = [];
    }
    onModuleInit() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.explore();
        });
    }
    onModuleDestroy() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.workers.map(worker => worker.shutdown());
                yield Promise.all(this.workerPromises);
                yield this.connection.close();
            }
            catch (e) {
                console.error('Workers or connection already closed');
            }
        });
    }
    runWorker(workerOptions) {
        return __awaiter(this, void 0, void 0, function* () {
            const newWorkerConfig = Object.assign(Object.assign(Object.assign({}, this.getWorkerConfigOptions()), { activities: this.activities, connection: this.connection }), workerOptions);
            const worker = yield worker_1.Worker.create(newWorkerConfig);
            const workerPromise = worker.run();
            const workerObject = { worker, workerPromise };
            this.workers.push(worker);
            this.workerPromises.push(workerPromise);
            return workerObject;
        });
    }
    explore() {
        return __awaiter(this, void 0, void 0, function* () {
            worker_1.Runtime.install({
                telemetryOptions: Object.assign({}, (process.env.DD_AGENT_HOST
                    ? { metrics: { otel: { url: `http://${process.env.DD_AGENT_HOST}:4317` } } }
                    : {})),
            });
            const nativeConnectionConfig = this.getNativeConnectionConfigOptions();
            this.connection = yield worker_1.NativeConnection.connect(nativeConnectionConfig);
            this.activities = yield this.handleActivities();
        });
    }
    getWorkerConfigOptions(name) {
        return this.moduleRef.get(temporal_constants_1.TEMPORAL_WORKER_CONFIG || name, {
            strict: false,
        });
    }
    getNativeConnectionConfigOptions(name) {
        return this.moduleRef.get(temporal_constants_1.TEMPORAL_NATIVE_CONNECTION_CONFIG || name, { strict: false });
    }
    handleActivities() {
        return __awaiter(this, void 0, void 0, function* () {
            const activitiesMethod = {};
            const activities = this.discoveryService
                .getProviders()
                .filter((wrapper) => {
                var _a;
                return this.metadataAccessor.isActivities(!wrapper.metatype || wrapper.inject
                    ? (_a = wrapper.instance) === null || _a === void 0 ? void 0 : _a.constructor
                    : wrapper.metatype);
            });
            activities.forEach((wrapper) => {
                const { instance, metatype } = wrapper;
                const isRequestScoped = !wrapper.isDependencyTreeStatic();
                const activitiesOptions = this.metadataAccessor.getActivities(instance.constructor || metatype);
                this.metadataScanner.scanFromPrototype(instance, Object.getPrototypeOf(instance), (key) => __awaiter(this, void 0, void 0, function* () {
                    if (this.metadataAccessor.isActivity(instance[key])) {
                        const metadata = this.metadataAccessor.getActivity(instance[key]);
                        let args = [metadata === null || metadata === void 0 ? void 0 : metadata.name];
                        if (isRequestScoped) {
                        }
                        else {
                            activitiesMethod[key] = instance[key].bind(instance);
                        }
                    }
                }));
            });
            return activitiesMethod;
        });
    }
};
TemporalExplorer = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.ModuleRef,
        core_1.DiscoveryService,
        temporal_metadata_accessors_1.TemporalMetadataAccessor,
        core_1.MetadataScanner])
], TemporalExplorer);
exports.TemporalExplorer = TemporalExplorer;
