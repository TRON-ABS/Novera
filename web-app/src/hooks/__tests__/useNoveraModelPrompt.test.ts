import { beforeEach, describe, expect, it, vi } from 'vitest'
import { localStorageKey } from '@/constants/localStorage'
import { useNoveraModelPromptDismissed } from '../useNoveraModelPrompt'

const storage = vi.hoisted(() => ({
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
}))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: storage }))

describe('Novera model prompt storage compatibility', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useNoveraModelPromptDismissed.setState({ dismissedModelName: null })
  })

  it('restores an existing dismissed model under the legacy persisted key', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({
      state: { dismissedModelName: 'existing-model' }, version: 1,
    }))
    await useNoveraModelPromptDismissed.persist.rehydrate()
    expect(localStorageKey.noveraModelPromptDismissed).toBe('jan-model-prompt-dismissed')
    expect(storage.getItem).toHaveBeenCalledWith('jan-model-prompt-dismissed')
    expect(useNoveraModelPromptDismissed.getState().dismissedModelName).toBe('existing-model')
  })

  it('keeps the version-zero migration after renaming the module', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({ state: { dismissed: true }, version: 0 }))
    await useNoveraModelPromptDismissed.persist.rehydrate()
    expect(useNoveraModelPromptDismissed.getState().dismissedModelName).toBeNull()
  })
})
