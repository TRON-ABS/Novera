import { create } from 'zustand'
import { persist, createJSONStorage, type StateStorage } from 'zustand/middleware'
import { localStorageKey } from '@/constants/localStorage'
import { backendStorage } from '@/lib/backendStorage'
import { getServiceHub } from '@/hooks/useServiceHub'
import { ExtensionManager } from '@/lib/extension'
import { detectSystemLanguage, isSupportedLanguage } from '@/lib/systemLanguage'

export const HUGGINGFACE_TOKEN_SECRET_KEY = 'huggingface'
type GeneralSettingState = {
  currentLanguage: Language
  spellCheckChatInput: boolean
  tokenCounterCompact: boolean
  autoUpdateCheck: boolean
  stripReasoningFromContext: boolean
  huggingfaceToken?: string
  setHuggingfaceToken: (token: string) => void
  setSpellCheckChatInput: (value: boolean) => void
  setTokenCounterCompact: (value: boolean) => void
  setAutoUpdateCheck: (value: boolean) => void
  setStripReasoningFromContext: (value: boolean) => void
  setCurrentLanguage: (value: Language) => void
}

// Presence of a saved language is the first-launch marker, including legacy English.
// Read the backend before detecting or saving anything: failed reads must never
// turn into a first-run reset of the user's preferences.
let languageChoiceRevision = 0
const generalSettingsStorage: StateStorage = {
  ...backendStorage,
  getItem: async (name: string) => {
    const revision = languageChoiceRevision
    const raw = await backendStorage.getItem(name)
    const saved = raw ? JSON.parse(raw) : null
    if (isSupportedLanguage(saved?.state?.currentLanguage) && revision === languageChoiceRevision) return raw
    let language = revision === languageChoiceRevision
      ? await detectSystemLanguage()
      : useGeneralSetting.getState().currentLanguage
    // A manual choice made while OS detection was pending always wins.
    if (revision !== languageChoiceRevision) language = useGeneralSetting.getState().currentLanguage
    const initialized = JSON.stringify({
      ...saved,
      version: saved?.version ?? 0,
      state: { ...saved?.state, currentLanguage: language },
    })
    await backendStorage.setItem(name, initialized)
    return initialized
  },
}

export const useGeneralSetting = create<GeneralSettingState>()(
  persist(
    (set) => ({
      currentLanguage: 'en',
      spellCheckChatInput: true,
      tokenCounterCompact: true,
      autoUpdateCheck: true,
      stripReasoningFromContext: false,
      huggingfaceToken: undefined,
      setSpellCheckChatInput: (value) => set({ spellCheckChatInput: value }),
      setTokenCounterCompact: (value) => set({ tokenCounterCompact: value }),
      setAutoUpdateCheck: (value) => set({ autoUpdateCheck: value }),
      setStripReasoningFromContext: (value) =>
        set({ stripReasoningFromContext: value }),
      setCurrentLanguage: (value) => {
        languageChoiceRevision++
        set({ currentLanguage: value })
      },
      setHuggingfaceToken: (token) => {
        set({ huggingfaceToken: token })
        // Canonical secret store is the OS keyring, not settings storage.
        getServiceHub()
          .core()
          .invoke('set_secret', {
            key: HUGGINGFACE_TOKEN_SECRET_KEY,
            value: token,
          })
          .catch((err) =>
            console.warn('Failed to persist huggingface token to keyring:', err)
          )
        ExtensionManager.getInstance()
          .getByName('@janhq/download-extension')
          ?.getSettings()
          .then((settings) => {
            if (settings) {
              const newSettings = settings.map((e) => {
                if (e.key === 'hf-token') {
                  e.controllerProps.value = token
                }
                return e
              })
              ExtensionManager.getInstance()
                .getByName('@janhq/download-extension')
                ?.updateSettings(newSettings)
            }
          })
          .catch((err) => {
            console.warn('Failed to persist huggingface token:', err)
          })
      },
    }),
    {
      name: localStorageKey.settingGeneral,
      storage: createJSONStorage(() => generalSettingsStorage),
      skipHydration: true,
      // huggingfaceToken is a secret — kept in the OS keyring, never persisted here.
      partialize: (state) => ({
        currentLanguage: state.currentLanguage,
        spellCheckChatInput: state.spellCheckChatInput,
        tokenCounterCompact: state.tokenCounterCompact,
        autoUpdateCheck: state.autoUpdateCheck,
        stripReasoningFromContext: state.stripReasoningFromContext,
      }),
    }
  )
)


