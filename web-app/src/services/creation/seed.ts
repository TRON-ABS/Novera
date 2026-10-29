import { useCreation, videoSettingsFor } from '@/hooks/useCreation'
import { useMediaLibrary } from '@/hooks/useMediaLibrary'
import { imageSeedPlan } from '@/modules/engines/image-seed'

/** Reserve once before the first start; retries retain the same concrete seed. */
export function reserveImageSeed(profileId?: string) {
  return reserveCreationSeed('image', profileId)
}

export function reserveCreationSeed(task: 'image' | 'video', profileId?: string) {
  const state = useCreation.getState()
  const library = useMediaLibrary.getState()
  const profile = library.profiles.find((p) => p.id === profileId && p.task === task)
  const settings = profile?.settings ?? (task === 'video' ? videoSettingsFor(state) : state.settings)
  const plan = imageSeedPlan(
    settings.seed,
    settings.seedMode ?? 'random',
    (settings.seedMode ?? 'random') === 'random'
      ? crypto.getRandomValues(new Uint32Array(1))[0]
      : 0
  )
  const update = { seed: plan.nextSeed, lastImageSeed: plan.seed }
  if (profile)
    library.put({ ...profile, settings: { ...profile.settings, ...update } })
  else if (task === 'video') state.setVideoSettings(update)
  else state.setSettings(update)
  return plan.seed
}
