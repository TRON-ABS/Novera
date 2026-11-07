export function resolvePublicTelemetry(
  env: Record<string, string | undefined>,
  defaults: { host: string; projectKey: string },
): { host: string; key: string }
