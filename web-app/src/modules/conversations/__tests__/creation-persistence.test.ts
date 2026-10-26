import { describe, expect, it } from 'vitest'
import { convertUIMessageToThreadMessage, convertThreadMessageToUIMessage } from '../messages'
import type { UIMessage } from 'ai'
describe('saved creations survive message persistence', () => {
  it.each(['image', 'video'])('preserves the %s reference without storing media bytes', kind => {
    const url = `novera-creation:${kind}/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${kind === 'image' ? 'png' : 'mp4'}`
    const input: UIMessage = { id: 'a', role: 'assistant', parts: [{ type: 'file', url, mediaType: kind === 'image' ? 'image/png' : 'video/mp4' }] }
    const persisted = convertUIMessageToThreadMessage(input, 'thread1')
    const restored = convertThreadMessageToUIMessage(persisted)
    expect(restored.parts[0]).toMatchObject({ type: 'file', url })
    expect(JSON.stringify(persisted)).not.toContain(';base64,')
  })
})
