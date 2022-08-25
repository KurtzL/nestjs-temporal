"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueToken = void 0;
function getQueueToken(name) {
    return name ? `TemporalQueue_${name}` : 'TemporalQueue_default';
}
exports.getQueueToken = getQueueToken;
