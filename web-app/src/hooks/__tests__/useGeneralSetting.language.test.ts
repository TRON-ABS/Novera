import { beforeEach, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ disk: new Map<string, string>(), read: vi.fn(), write: vi.fn(), detect: vi.fn() }))
vi.mock('@/lib/backendStorage', () => ({ backendStorage: {
  getItem: h.read, setItem: h.write, removeItem: vi.fn(),
} }))
vi.mock('@/lib/systemLanguage', async (importOriginal) => ({
  ...await importOriginal<typeof import('@/lib/systemLanguage')>(),
  detectSystemLanguage: h.detect,
}))
vi.mock('@/lib/extension', () => ({ ExtensionManager: { getInstance: () => ({ getByName: () => undefined }) } }))

beforeEach(() => {
  vi.resetModules()
  h.disk.clear()
  h.detect.mockReset().mockResolvedValue('fr')
  h.read.mockReset().mockImplementation(async (key: string) => h.disk.get(key) ?? null)
  h.write.mockReset().mockImplementation(async (key: string, value: string) => { h.disk.set(key, value) })
})

async function settings() {
  const { useGeneralSetting } = await import('../useGeneralSetting')
  const { localStorageKey } = await import('@/constants/localStorage')
  return { store: useGeneralSetting, key: localStorageKey.settingGeneral }
}

it('selects and saves the detected language on first launch, then keeps it after a restart', async () => {
  let { store, key } = await settings()
  await store.persist.rehydrate()
  expect(store.getState().currentLanguage).toBe('fr')
  expect(JSON.parse(h.disk.get(key)!).state.currentLanguage).toBe('fr')
  h.detect.mockResolvedValue('ja')
  vi.resetModules()
  ;({ store } = await settings())
  await store.persist.rehydrate()
  expect(store.getState().currentLanguage).toBe('fr')
  expect(h.detect).toHaveBeenCalledTimes(1)
})

it.each(['en', 'ar', 'pt-PT'])('preserves an existing %s preference and all other saved settings', async (language) => {
  const { store, key } = await settings()
  const saved = JSON.stringify({ state: { currentLanguage: language, spellCheckChatInput: false }, version: 0 })
  h.disk.set(key, saved)
  await store.persist.rehydrate()
  expect(store.getState().currentLanguage).toBe(language)
  expect(store.getState().spellCheckChatInput).toBe(false)
  expect(h.detect).not.toHaveBeenCalled()
  expect(h.disk.get(key)).toBe(saved)
})

it('keeps a manual change after restart even when the system language changes', async () => {
  let { store } = await settings()
  await store.persist.rehydrate()
  store.getState().setCurrentLanguage('ja')
  await vi.waitFor(() => expect(h.write).toHaveBeenCalledTimes(2))
  h.detect.mockResolvedValue('ar')
  vi.resetModules()
  ;({ store } = await settings())
  await store.persist.rehydrate()
  expect(store.getState().currentLanguage).toBe('ja')
  expect(h.detect).toHaveBeenCalledTimes(1)
})

it('does not reset preferences or detect a language when storage cannot be read', async () => {
  const { store } = await settings()
  h.read.mockRejectedValue(new Error('settings locked'))
  await store.persist.rehydrate()
  expect(store.persist.hasHydrated()).toBe(false)
  expect(h.detect).not.toHaveBeenCalled()
  expect(h.write).not.toHaveBeenCalled()
})

it('preserves other settings when initializing a legacy record without a language', async () => {
  const { store, key } = await settings()
  h.disk.set(key, JSON.stringify({ state: { spellCheckChatInput: false }, version: 0 }))
  await store.persist.rehydrate()
  expect(store.getState().spellCheckChatInput).toBe(false)
  expect(JSON.parse(h.disk.get(key)!).state).toEqual({ currentLanguage: 'fr', spellCheckChatInput: false })
})

it('does not overwrite a manual choice made while OS detection is pending', async () => {
  const { store } = await settings()
  let resolve!: (language: string) => void
  h.detect.mockReturnValue(new Promise<string>((done) => { resolve = done }))
  const hydrating = store.persist.rehydrate()
  await vi.waitFor(() => expect(h.detect).toHaveBeenCalledOnce())
  store.getState().setCurrentLanguage('de-DE')
  resolve('fr')
  await hydrating
  expect(store.getState().currentLanguage).toBe('de-DE')
})
