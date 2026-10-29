import { describe, expect, it } from 'vitest'
import { convertUIMessageToThreadMessage, convertThreadMessageToUIMessage, extractContentPartsFromUIMessage } from '../messages'
import type { UIMessage } from 'ai'
describe('saved creations survive message persistence', () => {
  it.each([
    ['image', 'png', 'image/png'], ['video', 'mp4', 'video/mp4'],
    ['music', 'mp3', 'audio/mpeg'], ['music', 'wav', 'audio/wav'],
  ])('preserves the %s/%s reference across repeated serialized history reloads', (kind, extension, mediaType) => {
    const url = `novera-creation:${kind}/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${extension}`
    let message: UIMessage = { id: 'a', role: 'assistant', parts: [{ type: 'file', url, mediaType }] }
    for (let restart = 0; restart < 3; restart++) {
      const persisted = convertUIMessageToThreadMessage(message, 'thread1')
      // The streaming save path uses the content extractor rather than the
      // compatibility converter; check both after disk-style JSON encoding.
      expect(extractContentPartsFromUIMessage(message)).toEqual(persisted.content)
      message = convertThreadMessageToUIMessage(JSON.parse(JSON.stringify(persisted)))
      expect(message.parts[0]).toMatchObject({ type: 'file', url, mediaType: kind === 'image' ? 'image/jpeg' : mediaType })
      expect(JSON.stringify(persisted)).not.toContain(';base64,')
    }
  })
  it.each(['mp3', 'wav'])('repairs a legacy data-URL wrapper around a saved %s creation reference', (format) => {
    const url = `novera-creation:music/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${format}`
    const mime = format === 'mp3' ? 'audio/mpeg' : 'audio/wav'
    const input: UIMessage = { id: 'a', role: 'assistant', parts: [{ type: 'file', url, mediaType: mime }] }
    const persisted = convertUIMessageToThreadMessage(input, 'thread1')
    persisted.content[0].input_audio!.data = `data:${mime};base64,${url}`
    expect(convertThreadMessageToUIMessage(persisted).parts[0]).toMatchObject({ url })
  })
})
