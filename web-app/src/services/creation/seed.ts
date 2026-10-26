import { useCreation } from '@/hooks/useCreation'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { imageSeedPlan } from '@/modules/engines/image-seed'

/** Reserve once before the first start; retries retain the same concrete seed. */
export function reserveImageSeed(profileId?: string) {
  const state = useCreation.getState()
  const library = useMediaLibrary.getState()
  const profile = library.profiles.find((p) => p.id === profileId)
  const settings = profile?.settings ?? state.settings
  const plan = imageSeedPlan(
    settings.seed,
    settings.seedMode,
    settings.seedMode === 'random'
      ? crypto.getRandomValues(new Uint32Array(1))[0]
      : 0
  )
  const update = { seed: plan.nextSeed, lastImageSeed: plan.seed }
  if (profile)
    library.put({ ...profile, settings: { ...profile.settings, ...update } })
  else state.setSettings(update)
  return plan.seed
}
