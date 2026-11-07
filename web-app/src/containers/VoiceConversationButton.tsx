import { useEffect, useId, useMemo, useRef, useSyncExternalStore } from 'react'
import { Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import type { ThreadMessage } from '@janhq/core'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useGeneralSetting } from '@/hooks/useGeneralSetting'
import { useThreads } from '@/hooks/useThreads'
import { voiceConversation, type VoiceBinding } from '@/lib/voiceConversation'
import { createVoiceBackend, voiceLocale, voiceSupported } from '@/lib/voicePlatform'
import { toast } from 'sonner'
import { createOmniVoiceBackend, omniVoiceSupported } from '@/lib/omniVoice'
import { useModelProvider } from '@/hooks/useModelProvider'
import { getServiceHub } from '@/hooks/useServiceHub'
import { getEngineInfo } from '@janhq/tauri-plugin-llamacpp-api'

export function VoiceConversationButton({ scope, isNew, eligible, busy, failed, canStart, canContinue, modelKey, omniModelId, messages, submit, transcribe, recover }: {
  scope: string
  isNew: boolean
  eligible: boolean
  busy: boolean
  failed: boolean
  canStart: boolean
  canContinue?: boolean
  modelKey: string
  omniModelId?: string
  messages: ThreadMessage[]
  submit(text: string): Promise<unknown>
  transcribe?(text: string): void
  recover?(text: string): void
}) {
  const { t } = useTranslation()
  const phase = useSyncExternalStore(voiceConversation.subscribe, voiceConversation.snapshot)
  const active = phase !== 'idle'
  const language = useGeneralSetting(state => state.currentLanguage) ?? navigator.language
  const voiceGender = useGeneralSetting(state => state.voiceGender) === 'female' ? 'female' : 'male'
  const readReplies = useGeneralSetting(state => state.readReplies) !== false
  const setReadReplies = useGeneralSetting(state => state.setReadReplies)
  const previousLanguage = useRef(language)
  const threads = useThreads(state => state.threads)
  const knownScopes = useMemo(() => Object.keys(threads), [threads])
  const statusId = useId()
  let assistant: ThreadMessage | undefined
  let user: ThreadMessage | undefined
  for (let index = messages.length - 1; index >= 0 && (!assistant || !user); index--) {
    const message = messages[index]
    if (!assistant && message.role === 'assistant') assistant = message
    if (!user && message.role === 'user') user = message
  }
  const text = (message?: ThreadMessage) => message?.content
    .filter(part => part.type === 'text').map(part => part.text?.value ?? '').join('\n') ?? ''
  const binding: VoiceBinding = {
    scope, isNew, busy: busy || assistant?.status === 'pending', failed,
    canStart: canStart || (active && canContinue === true),
    context: `${language}|${modelKey}|${voiceGender}`,
    replyId: assistant?.id ?? '', reply: text(assistant), lastUserText: text(user),
    replyComplete: assistant?.metadata?.finishReason !== 'tool-calls',
    lastUserAt: user?.created_at && user.created_at < 1e12 ? user.created_at * 1000 : user?.created_at,
    knownScopes, submit, transcribe, recover,
    error: stage => {
      // Stage only: never log speech, prompt, reply or raw native errors.
      console.warn('[Novera voice] operation failed', stage ?? 'start')
      toast.error(t('common:voiceUnavailable'))
    },
  }
  const supported = eligible && (omniModelId ? omniVoiceSupported() : voiceSupported())
  const createBackend = () => {
    const locale=voiceLocale(language)
    return omniModelId ? createOmniVoiceBackend(locale, {
      model:omniModelId,voice:voiceGender,
      prepare: async signal => {
        const provider=useModelProvider.getState().getProviderByName('llamacpp')
        if(!provider)throw new Error('unavailable')
        await getServiceHub().models().startModel(provider,omniModelId)
        if(signal.aborted)throw new Error('cancelled')
        const engine=await getEngineInfo()
        if(!engine)throw new Error('unavailable')
        return engine
      },
    }) : createVoiceBackend(locale)
  }
  useEffect(() => {
    if (!eligible) return
    voiceConversation.setOutputEnabled(readReplies)
    voiceConversation.observe(binding)
    voiceConversation.configureAutoRead(supported && readReplies ? {createBackend,binding:{...binding,canStart:canContinue??canStart}} : undefined)
  })
  useEffect(() => {
    if (previousLanguage.current !== language) voiceConversation.stop()
    previousLanguage.current = language
  }, [language])
  useEffect(() => {
    if (!eligible) return
    const stop = () => voiceConversation.stop()
    const visibility = () => { if (document.hidden) stop() }
    window.addEventListener('blur', stop)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      window.removeEventListener('blur', stop)
      document.removeEventListener('visibilitychange', visibility)
      voiceConversation.detach()
      voiceConversation.configureAutoRead(undefined)
    }
  }, [eligible])
  const occupied = active || binding.busy
  const availability = !supported ? 'unavailable' : occupied ? 'busy' : canStart ? 'ready' : 'unavailable'
  const label = supported
    ? `${t(active ? 'common:stop' : occupied ? 'common:loading' : canStart ? 'common:start' : 'common:voiceUnavailable')} — ${t('common:voiceConversation')}`
    : t('common:voiceUnavailable')
  return <div className="composer-voice-controls">
    <button
      type="button"
      className="composer-voice-button"
      data-testid="voice-conversation-button"
      data-voice-phase={phase}
      data-voice-state={availability}
      aria-label={label}
      title={label}
      aria-pressed={active}
      aria-describedby={active ? statusId : undefined}
      disabled={!supported || (!active && (!canStart || occupied))}
      onClick={() => {
        if (active) { voiceConversation.stop(); return }
        try {
          voiceConversation.start(createBackend(), binding)
        } catch { binding.error() }
      }}
    >
      {active && phase !== 'listening' ? <MicOff size={14} aria-hidden="true" /> : <Mic size={14} aria-hidden="true" />}
    </button>
    <button type="button" className="composer-sound-button" data-testid="voice-sound-button"
      aria-label={t('common:voiceReadReplies')} aria-pressed={readReplies}
      title={`${t('common:voiceReadReplies')} — ${t(readReplies ? 'ui:on' : 'ui:off')}`}
      disabled={!eligible}
      onClick={() => { voiceConversation.setOutputEnabled(!readReplies); setReadReplies(!readReplies) }}>
      {readReplies ? <Volume2 size={12} aria-hidden="true" /> : <VolumeX size={12} aria-hidden="true" />}
    </button>
    <span id={statusId} className="sr-only" role="status">
      {active ? `${t('common:voiceConversation')} — ${t(phase === 'review' ? 'common:edit' : ['waiting','preparing','transcribing'].includes(phase) ? 'common:loading' : 'ui:on')}` : ''}
    </span>
  </div>
}
