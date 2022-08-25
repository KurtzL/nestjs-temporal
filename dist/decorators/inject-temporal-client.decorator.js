"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InjectTemporalClient = void 0;
const common_1 = require("@nestjs/common");
const utils_1 = require("../utils");
const InjectTemporalClient = (name) => (0, common_1.Inject)((0, utils_1.getQueueToken)(name));
exports.InjectTemporalClient = InjectTemporalClient;
