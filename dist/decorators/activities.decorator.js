"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activities = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const temporal_constants_1 = require("../temporal.constants");
function Activities(queueNameOrOptions) {
    const options = queueNameOrOptions && typeof queueNameOrOptions === 'object'
        ? queueNameOrOptions
        : { name: queueNameOrOptions };
    return (target) => {
        (0, common_1.SetMetadata)(constants_1.SCOPE_OPTIONS_METADATA, options)(target);
        (0, common_1.SetMetadata)(temporal_constants_1.TEMPORAL_MODULE_ACTIVITIES, options)(target);
    };
}
exports.Activities = Activities;
