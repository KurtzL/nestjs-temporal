export function getQueueOptionsToken(name?: string): string {
  return name ? `TemporalQueueOptions_${name}` : 'TemporalQueueOptions_default';
}
