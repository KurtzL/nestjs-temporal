export function getQueueToken(name?: string): string {
  return name ? `TemporalQueue_${name}` : 'TemporalQueue_default';
}
