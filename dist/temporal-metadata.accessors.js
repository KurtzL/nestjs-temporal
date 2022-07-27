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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemporalMetadataAccessor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const temporal_constants_1 = require("./temporal.constants");
let TemporalMetadataAccessor = class TemporalMetadataAccessor {
    constructor(reflector) {
        this.reflector = reflector;
    }
    isActivities(target) {
        if (!target)
            return false;
        return !!this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_ACTIVITIES, target);
    }
    getActivities(target) {
        return this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_ACTIVITIES, target);
    }
    isActivity(target) {
        if (!target)
            return false;
        return !!this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_ACTIVITY, target);
    }
    getActivity(target) {
        return this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_ACTIVITY, target);
    }
    isWorkflows(target) {
        if (!target)
            return false;
        return !!this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_WORKFLOW, target);
    }
    getWorkflows(target) {
        return this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_WORKFLOW, target);
    }
    isWorkflowMethod(target) {
        if (!target)
            return false;
        return !!this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_WORKFLOW_METHOD, target);
    }
    getWorkflowMethod(target) {
        return this.reflector.get(temporal_constants_1.TEMPORAL_MODULE_WORKFLOW_METHOD, target);
    }
};
TemporalMetadataAccessor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], TemporalMetadataAccessor);
exports.TemporalMetadataAccessor = TemporalMetadataAccessor;
