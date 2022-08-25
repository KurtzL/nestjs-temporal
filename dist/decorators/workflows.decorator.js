"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workflows = void 0;
const common_1 = require("@nestjs/common");
const constants_1 = require("@nestjs/common/constants");
const temporal_constants_1 = require("../temporal.constants");
function Workflows(nameOrOptions) {
    const options = nameOrOptions && typeof nameOrOptions === 'object'
        ? nameOrOptions
        : { name: nameOrOptions };
    return (target) => {
        (0, common_1.SetMetadata)(constants_1.SCOPE_OPTIONS_METADATA, options)(target);
        (0, common_1.SetMetadata)(temporal_constants_1.TEMPORAL_MODULE_WORKFLOW, options)(target);
    };
}
exports.Workflows = Workflows;
