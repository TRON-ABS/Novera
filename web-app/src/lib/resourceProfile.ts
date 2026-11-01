/** MiB inputs, matching the native hardware plugin. Thresholds are conservative
 * product budgets, not measured guarantees for a device or a model. */
export function resourceProfile(input: {
  platform: string; ramMiB: number; availableMiB?: number; gpuMiB: number
  unified?: boolean; engineBuild?: string; mobile?: boolean
}) {
  const mobile = input.mobile || /^(android|ios)$/i.test(input.platform)
  const known = Number.isFinite(input.ramMiB) && input.ramMiB > 0
  const ram = known ? input.ramMiB : 0
  // Native RAM excludes hardware-reserved memory: a nominal 16 GiB machine
  // can report 15,789 MiB. Allow 5% for total-capacity tiers only; available
  // memory budgets and the native execution checks still use actual values.
  const hasRamTier = (minimum: number) => known && ram >= minimum * 0.95
  const gpu = Number.isFinite(input.gpuMiB) ? Math.max(0, input.gpuMiB) : 0
  const free = Number.isFinite(input.availableMiB) && input.availableMiB! >= 0
    ? Math.min(ram, input.availableMiB!) : undefined
  const light = !!mobile || !hasRamTier(16384) || (!input.unified && gpu < 4096)
  const engineReady = /^\d+$/.test(input.engineBuild ?? '') && Number(input.engineBuild) >= 11960
  const omni = light && hasRamTier(8192) && free !== undefined && free >= 4096 && engineReady
  const textFits = hasRamTier(4096) && free !== undefined && free >= 2560
  // Unknown desktop hardware retains existing manually configured workflows;
  // it never qualifies for an automatic pack recommendation.
  const image = !mobile && (!known || (hasRamTier(12288) && (gpu >= 4096 || !!input.unified)))
  const music = !mobile && ((!known && !input.platform) || (/windows/i.test(input.platform) && (!known || hasRamTier(16384))))
  const video = !mobile && (!known || (hasRamTier(16384) && (gpu >= 6144 || (!!input.unified && hasRamTier(24576)))))
  return {
    known, light, omni, engineReady, textFits, context: light ? 2048 : 16384,
    local: { image, music, video },
    fullPack: known && !light && image && music && video && free !== undefined && free >= 10240,
  }
}
