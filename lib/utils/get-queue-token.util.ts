export function getQueueToken(name?: string): string {
  return name ? `TemporalQueue_${name}` : 'TemporalQueue_default';
}

export function getAsyncQueueToken(name?: string): string {
  return name ? `TemporalAsyncQueue_${name}` : 'TemporalAsyncQueue_default';
}
