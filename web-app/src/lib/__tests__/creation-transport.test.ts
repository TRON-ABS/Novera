import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CustomChatTransport } from '../custom-chat-transport'
import { useCreation } from '@/hooks/useCreation'
import { useAgentMode } from '@/hooks/useAgentMode'
import { creationStream } from '@/services/creation/stream'

vi.mock('@/services/creation/stream', () => ({ creationStream: vi.fn(() => new ReadableStream({ start(controller) { controller.close() } })) }))
const options = { chatId: 'media-thread', messages: [{ id: 'u', role: 'user' as const, parts: [{ type: 'text' as const, text: 'a landscape' }] }], abortSignal: undefined, trigger: 'submit-message' as const, messageId: 'u' }
describe('media dispatch before text model creation', () => {
  beforeEach(() => { vi.clearAllMocks(); useCreation.setState({ modes: {} }); useAgentMode.setState({ agentThreads: {} }) })
  it('can dispatch a media request without creating or selecting a text model', async () => {
    useCreation.getState().setMode('media-thread', 'image')
    const stream = await new CustomChatTransport(undefined, 'media-thread').sendMessages(options)
    expect(stream).toBeInstanceOf(ReadableStream)
    expect(creationStream).toHaveBeenCalledWith('image', 'a landscape', options.messages, 'media-thread', undefined, expect.any(Function))
  })
  it('does not redirect Agent turns to the media worker', async () => {
    useCreation.getState().setMode('media-thread', 'image')
    useAgentMode.getState().setAgentMode('media-thread', true)
    await expect(new CustomChatTransport(undefined, 'media-thread').sendMessages(options)).rejects.toThrow()
    expect(creationStream).not.toHaveBeenCalled()
  })
})
