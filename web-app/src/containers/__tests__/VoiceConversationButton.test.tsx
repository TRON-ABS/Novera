import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import type { ThreadMessage } from '@janhq/core'

const voice = vi.hoisted(() => ({ phase: 'idle', supported: true, output: 'model', stop: vi.fn(), setReadReplies:vi.fn() }))
const browserVoice = vi.hoisted(() => ({ create: vi.fn(() => ({ browser: true })), unlock: vi.fn() }))
vi.mock('@/services/browser-preview/voice', () => ({ browserVoiceSupported: () => true, createBrowserVoiceBackend: browserVoice.create, unlockBrowserVoice: browserVoice.unlock }))
vi.mock('@/hooks/useBrowserSystemVoices', () => ({ useBrowserSystemVoices: () => [{ voiceURI: 'local-fr', name: 'French', lang: 'fr-FR', localService: true }] }))
afterEach(() => vi.unstubAllEnvs())
vi.mock('@/i18n/react-i18next-compat', () => ({ useTranslation: () => ({ t: (key: string) => key }) }))
vi.mock('@/hooks/useGeneralSetting', () => ({ useGeneralSetting: (selector: (state: unknown)=>unknown) => selector({currentLanguage:'fr-FR',voiceGender:'male',webVoiceOutput:voice.output,webSystemVoiceURI:'',readReplies:true,setReadReplies:voice.setReadReplies}) }))
vi.mock('@/hooks/useThreads', () => ({ useThreads: () => ({}) }))
vi.mock('@/lib/voicePlatform', () => ({
  voiceSupported: () => voice.supported,
  voiceLocale: (locale: string) => locale,
  createVoiceBackend: vi.fn(),
}))
vi.mock('@/lib/voiceConversation', () => ({ voiceConversation: {
  snapshot: () => voice.phase,
  subscribe: () => () => {},
  observe: vi.fn(), detach: vi.fn(), start: vi.fn(), stop: voice.stop, configureAutoRead:vi.fn(), setOutputEnabled:vi.fn(),
} }))

import { VoiceConversationButton } from '../VoiceConversationButton'
import { voiceConversation } from '@/lib/voiceConversation'

const defaults = {
  scope: 'thread-1', isNew: false, eligible: true, busy: false, failed: false,
  canStart: true, modelKey: 'local|model', messages: [] as ThreadMessage[], submit: vi.fn(),
}
const button = () => screen.getByTestId('voice-conversation-button')

describe('microphone availability', () => {
  it('can read with a local system voice while leaving an unavailable microphone disabled', async () => {
    vi.stubEnv('VITE_NOVERA_WEB_PREVIEW', 'true')
    voice.output = 'system'; voice.supported = false
    render(<VoiceConversationButton {...defaults} />)
    expect(button()).toBeDisabled()
    const configuration = vi.mocked(voiceConversation.configureAutoRead).mock.calls.at(-1)?.[0]
    expect(configuration).toMatchObject({ createBackend: expect.any(Function) })
    await expect(configuration!.createBackend().listen(new AbortController().signal)).rejects.toThrow('unavailable')
    expect(browserVoice.create).not.toHaveBeenCalled()
  })
  it('uses the local WebGPU voice adapter for browser Omni', () => {
    vi.stubEnv('VITE_NOVERA_WEB_PREVIEW', 'true')
    render(<VoiceConversationButton {...defaults} omniModelId="LFM3-Omni-2B-Q4_K_M" />)
    fireEvent.click(button())
    expect(browserVoice.unlock).toHaveBeenCalled()
    expect(browserVoice.create).toHaveBeenCalledWith('LFM3-Omni-2B-Q4_K_M', 'fr-FR', undefined, 'male')
    expect(voiceConversation.start).toHaveBeenCalledWith({ browser: true }, expect.objectContaining({ scope: 'thread-1' }))
  })
  it('marks tool-call steps as intermediate even when they contain text',()=>{
    render(<VoiceConversationButton {...defaults} messages={[
      {id:'step',role:'assistant',status:'ready',metadata:{finishReason:'tool-calls'},content:[{type:'text',text:{value:'Je recherche.'}}]} as unknown as ThreadMessage,
    ]} />)
    expect(voiceConversation.observe).toHaveBeenLastCalledWith(expect.objectContaining({reply:'Je recherche.',replyComplete:false}))
  })
  it('shares the read-replies preference and immediately mutes output without stopping input', () => {
    render(<VoiceConversationButton {...defaults} />)
    const sound=screen.getByTestId('voice-sound-button')
    expect(sound).toHaveAttribute('aria-pressed','true')
    fireEvent.click(sound)
    expect(voice.setReadReplies).toHaveBeenCalledWith(false)
    expect(voiceConversation.setOutputEnabled).toHaveBeenLastCalledWith(false)
    expect(voice.stop).not.toHaveBeenCalled()
  })
  it('can arm read-aloud with a typed draft while microphone start is disabled', () => {
    render(<VoiceConversationButton {...defaults} canStart={false} canContinue />)
    expect(button()).toBeDisabled()
    expect(voiceConversation.configureAutoRead).toHaveBeenCalledWith(expect.objectContaining({binding:expect.objectContaining({canStart:true})}))
  })
  beforeEach(() => { voice.phase = 'idle'; voice.supported = true; voice.output = 'model'; vi.clearAllMocks() })

  it('is ready and enabled when a voice turn can start', () => {
    render(<VoiceConversationButton {...defaults} />)
    expect(button()).toHaveAttribute('data-voice-state', 'ready')
    expect(button()).toBeEnabled()
    expect(button()).toHaveAccessibleName('common:start — common:voiceConversation')
  })

  it.each(['listening', 'waiting', 'speaking'])('remains stoppable while %s', phase => {
    voice.phase = phase
    render(<VoiceConversationButton {...defaults} busy={phase === 'waiting'} canStart={false} />)
    expect(button()).toHaveAttribute('data-voice-state', 'busy')
    expect(button()).toBeEnabled()
    expect(button()).toHaveAccessibleName('common:stop — common:voiceConversation')
    fireEvent.click(button())
    expect(voice.stop).toHaveBeenCalledOnce()
  })

  it('is busy and disabled during a model response outside voice mode', () => {
    render(<VoiceConversationButton {...defaults} busy />)
    expect(button()).toHaveAttribute('data-voice-state', 'busy')
    expect(button()).toBeDisabled()
    expect(button()).toHaveAccessibleName('common:loading — common:voiceConversation')
  })

  it('treats a pending assistant message as busy before the parent updates', () => {
    render(<VoiceConversationButton {...defaults} messages={[
      { id: 'answer', role: 'assistant', status: 'pending', content: [] } as unknown as ThreadMessage,
    ]} />)
    expect(button()).toHaveAttribute('data-voice-state', 'busy')
    expect(button()).toBeDisabled()
  })

  it('is unavailable when local voice is unsupported', () => {
    voice.supported = false
    render(<VoiceConversationButton {...defaults} />)
    expect(button()).toHaveAttribute('data-voice-state', 'unavailable')
    expect(button()).toBeDisabled()
    expect(button()).toHaveAccessibleName('common:voiceUnavailable')
  })

  it('is unavailable when the current draft prevents starting', () => {
    render(<VoiceConversationButton {...defaults} canStart={false} />)
    expect(button()).toHaveAttribute('data-voice-state', 'unavailable')
    expect(button()).toBeDisabled()
  })
})
