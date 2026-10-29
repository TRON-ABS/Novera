import { describe, expect, it } from 'vitest'
import { convertUIMessageToThreadMessage, convertThreadMessageToUIMessage, extractContentPartsFromUIMessage, creationInfoOf } from '../messages'
import type { UIMessage } from 'ai'
describe('saved creations survive message persistence', () => {
  it.each([
    ['image', 'png', 'image/png'], ['video', 'mp4', 'video/mp4'],
    ['music', 'mp3', 'audio/mpeg'], ['music', 'wav', 'audio/wav'],
  ])('preserves the %s/%s reference across repeated serialized history reloads', (kind, extension, mediaType) => {
    const url = `novera-creation:${kind}/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${extension}`
    const timing = { totalMs: 36250, generationMs: 30000, seed: 42 }
    let message: UIMessage = { id: 'a', role: 'assistant', parts: [{ type: 'file', url, mediaType, providerMetadata: { novera: timing } }] }
    for (let restart = 0; restart < 3; restart++) {
      const persisted = convertUIMessageToThreadMessage(message, 'thread1')
      // The streaming save path uses the content extractor rather than the
      // compatibility converter; check both after disk-style JSON encoding.
      expect(extractContentPartsFromUIMessage(message)).toEqual(persisted.content)
      expect(persisted.metadata?.creationInfo).toEqual({ [url]: timing })
      message = convertThreadMessageToUIMessage(JSON.parse(JSON.stringify(persisted)))
      expect(message.parts[0]).toMatchObject({ type: 'file', url, mediaType: kind === 'image' ? 'image/jpeg' : mediaType })
      expect(message.parts[0]).toMatchObject({ providerMetadata: { novera: timing } })
      expect(JSON.stringify(persisted)).not.toContain(';base64,')
    }
  })
  it('keeps separate timings for each creation in a batch, including zero durations', () => {
    const urls = ['aaaaaaaa','bbbbbbbb'].map(id => `novera-creation:image/Novera-${id}-bbbb-cccc-dddd-eeeeeeeeeeee.png`)
    const message: UIMessage = { id: 'batch', role: 'assistant', parts: urls.map((url,index) => ({ type: 'file',url,mediaType:'image/png',providerMetadata:{ novera:{totalMs:index*1000,generationMs:0,seed:index} } })) }
    const saved = convertUIMessageToThreadMessage(message,'thread')
    const loaded = convertThreadMessageToUIMessage(JSON.parse(JSON.stringify(saved)))
    expect(loaded.parts).toHaveLength(2)
    loaded.parts.forEach((part,index) => expect(part).toMatchObject({url:urls[index],providerMetadata:{novera:{totalMs:index*1000,generationMs:0,seed:index}}}))
  })
  it('does not store unrelated provider metadata or fabricate timings for legacy files', () => {
    const url='novera-creation:video/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.mp4'
    const message: UIMessage={ id:'legacy',role:'assistant',parts:[{type:'file',url,mediaType:'video/mp4',providerMetadata:{novera:{totalMs:-1,token:'not-public'},other:{secret:'not-public'}}}] }
    expect(creationInfoOf(message)).toBeUndefined()
    expect(JSON.stringify(convertUIMessageToThreadMessage(message,'thread'))).not.toContain('not-public')
    const loaded=convertThreadMessageToUIMessage(convertUIMessageToThreadMessage(message,'thread'))
    expect(loaded.parts[0]).not.toHaveProperty('providerMetadata')
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
