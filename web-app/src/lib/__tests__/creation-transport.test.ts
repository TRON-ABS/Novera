import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomChatTransport } from '../custom-chat-transport'
import { useCreation } from '@/hooks/useCreation'
import { useAgentMode } from '@/hooks/useAgentMode'
import { creationStream } from '@/services/creation/stream'

vi.mock('@/services/creation/stream', () => ({ creationStream: vi.fn(() => new ReadableStream({ start(controller) { controller.close() } })) }))
const options = { chatId: 'media-thread', messages: [{ id: 'u', role: 'user' as const, parts: [{ type: 'text' as const, text: 'a landscape' }] }], abortSignal: undefined, trigger: 'submit-message' as const, messageId: 'u' }
describe('media dispatch before text model creation', () => {
  beforeEach(() => { vi.clearAllMocks(); useCreation.setState({ modes: {}, resolvedModes: {} }); useAgentMode.setState({ agentThreads: {} }) })
  it('dispatches an automatic film soundtrack to music and publishes its effective mode without disabling Auto', async () => {
    const request = "Crée une bande originale épique de 3 minutes pour le film La Communauté de l'Anneau"
    const messages = [{ id: 'u', role: 'user' as const, parts: [{ type: 'text' as const, text: request }] }]
    await new CustomChatTransport(undefined, 'media-thread').sendMessages({ ...options, messages })
    expect(creationStream).toHaveBeenCalledWith('music', request, messages, 'media-thread', undefined, expect.any(Function))
    expect(useCreation.getState().resolvedModes['media-thread']).toBe('music')
    expect(useCreation.getState().modes['media-thread']).toBeUndefined()
    expect(useCreation.getState().resolvedModes['other-thread']).toBeUndefined()
  })
  it('can dispatch a media request without creating or selecting a text model', async () => {
    useCreation.getState().setMode('media-thread', 'image')
    const stream = await new CustomChatTransport(undefined, 'media-thread').sendMessages(options)
    expect(stream).toBeInstanceOf(ReadableStream)
    expect(creationStream).toHaveBeenCalledWith('image', 'a landscape', options.messages, 'media-thread', undefined, expect.any(Function))
  })
  it('dispatches song sections pasted directly into Auto without requiring a creation verb', async () => {
    const request = '[Intro]\nPremière ligne\nDeuxième ligne\n[Chorus]\nTroisième ligne\nQuatrième ligne'
    const messages = [{ id: 'u', role: 'user' as const, parts: [{ type: 'text' as const, text: request }] }]
    await new CustomChatTransport(undefined, 'media-thread').sendMessages({ ...options, messages })
    expect(creationStream).toHaveBeenCalledWith('music', request, messages, 'media-thread', undefined, expect.any(Function))
    expect(useCreation.getState().resolvedModes['media-thread']).toBe('music')
    expect(useCreation.getState().modes['media-thread']).toBeUndefined()
  })
  it('does not redirect Agent turns to the media worker', async () => {
    useCreation.getState().setMode('media-thread', 'image')
    useAgentMode.getState().setAgentMode('media-thread', true)
    await expect(new CustomChatTransport(undefined, 'media-thread').sendMessages(options)).rejects.toThrow()
    expect(creationStream).not.toHaveBeenCalled()
  })
})
