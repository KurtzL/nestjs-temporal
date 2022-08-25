"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkflowMethod = void 0;
const common_1 = require("@nestjs/common");
const temporal_constants_1 = require("../temporal.constants");
function WorkflowMethod(nameOrOptions) {
    const options = nameOrOptions && typeof nameOrOptions === 'object'
        ? nameOrOptions
        : { name: nameOrOptions };
    return (0, common_1.SetMetadata)(temporal_constants_1.TEMPORAL_MODULE_WORKFLOW_METHOD, options || {});
}
exports.WorkflowMethod = WorkflowMethod;
