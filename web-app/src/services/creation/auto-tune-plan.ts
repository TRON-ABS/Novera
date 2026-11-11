// Increment when the set of measured configurations changes. Model selections
// stay stable, but completed work must not hide a newly expanded campaign.
export const autoTuneSuiteRevision = 6

// These models are exercised by their owning pipeline, not as chat models.
export type AutoTuneComponent = {
  model: string
  role: 'generator' | 'encoder' | 'vae' | 'planner' | 'upscaler'
}

export const browserTextCalibrationRevision = 7
export const browserTextBatchSizes: readonly number[] = [8, 16, 32, 64, 128, 256]

export const browserTextProfiles = (['gpu', 'cpu'] as const).flatMap(sampling =>
  browserTextBatchSizes.map(commandBatchSize => ({ sampling, commandBatchSize })),
)

export const browserMusicProfiles = [true, false].flatMap(ditWindows =>
  [true, false].flatMap(encoderWindows =>
    [true, false].map(plannerWindows => ({
      label: [
        `DiT: ${ditWindows ? '64 MiB' : 'WorkerFS'}`,
        `Qwen3: ${encoderWindows ? '64 MiB' : 'WorkerFS'}`,
        `5Hz-LM: ${plannerWindows ? '64 MiB' : 'WorkerFS'}`,
      ].join(' · '),
      settings: { ditWindows, encoderWindows, plannerWindows },
    })),
  ),
)

export function nativeTextChecks(provider: string): string[] {
  if (provider === 'llamacpp' && typeof IS_ANDROID !== 'undefined' && IS_ANDROID) {
    return ['CPU: Auto', 'CPU: 2', 'CPU: 4']
  }
  if (provider === 'llamacpp') return ['Auto', '2', '4', '8'].flatMap(threads =>
    ['mmap: Auto', 'mmap: OFF'].map(load => `CPU: ${threads} · ${load}`))
  if (provider === 'mlx') return [0, 64, 128, 256].map(cache => `MLX · ${cache} MiB`)
  return ['Auto', '2', '4', '8'].map(threads => `CPU: ${threads}`)
}

export function autoTuneCampaignKey(browser: boolean, version: string) {
  return `novera-auto-tune-completed-profiles:${browser ? 'web' : 'native'}:${version}:v${autoTuneSuiteRevision}`
}
