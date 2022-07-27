"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Activity = void 0;
const common_1 = require("@nestjs/common");
const temporal_constants_1 = require("../temporal.constants");
function Activity(nameOrOptions) {
    const options = nameOrOptions && typeof nameOrOptions === 'object'
        ? nameOrOptions
        : { name: nameOrOptions };
    return (0, common_1.SetMetadata)(temporal_constants_1.TEMPORAL_MODULE_ACTIVITY, options || {});
}
exports.Activity = Activity;
