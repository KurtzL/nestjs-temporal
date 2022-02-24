export const TEMPORAL_CONFIG_DEFAULT_TOKEN = 'TEMPORAL_CONFIG(default)';

export function getSharedConfigToken(configKey?: string): string {
  return configKey
    ? `TEMPORAL_CONFIG(${configKey})`
    : TEMPORAL_CONFIG_DEFAULT_TOKEN;
}
