"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getQueueOptionsToken = void 0;
function getQueueOptionsToken(name) {
    return name ? `TemporalQueueOptions_${name}` : 'TemporalQueueOptions_default';
}
exports.getQueueOptionsToken = getQueueOptionsToken;
