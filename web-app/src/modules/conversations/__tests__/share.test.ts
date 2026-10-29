import { describe, expect, it } from 'vitest'
import { ContentType, MessageStatus, type ThreadMessage } from '@janhq/core'
import {
  shareEntries,
  selectShareEntries,
  formatsForShare,
  type ShareOptions,
} from '../share'
const m = (
  id: string,
  role: 'user' | 'assistant',
  text: string,
  metadata: Record<string, unknown> = {}
): ThreadMessage => ({
  id,
  thread_id: 't',
  object: 'thread.message',
  role,
  content: [{ type: ContentType.Text, text: { value: text, annotations: [] } }],
  status: MessageStatus.Ready,
  created_at: 1,
  completed_at: 1,
  metadata,
})
const options: ShareOptions = {
  scope: 'conversation',
  selected: [],
  questions: true,
  sources: true,
  parameters: false,
}
describe('share selection', () => {
  it('includes the entire active path while omitting inactive versions and internal reasoning', () => {
    const messages = [
      m('root', 'user', 'Question', { parentId: null, activeChildId: 'a' }),
      m('a', 'assistant', '<think>secret</think>Visible', { parentId: 'root' }),
      m('b', 'assistant', 'Hidden', { parentId: 'root' }),
    ]
    const entries = shareEntries(messages, 'root')
    expect(entries.map((e) => e.id)).toEqual(['root', 'a'])
    expect(entries[1].text).toBe('Visible')
    expect(
      selectShareEntries(entries, { ...options, questions: false }).map(
        (e) => e.id
      )
    ).toEqual(['a'])
    expect(
      selectShareEntries(entries, {
        ...options,
        scope: 'selection',
        selected: ['b'],
      })
    ).toEqual([])
  })
  it('shares only the clicked media when a response contains several assets', () => {
    const message = m('a', 'assistant', 'Rendered image')
    message.content.push(
      {
        type: ContentType.Image,
        image_url: {
          url: 'novera-creation:image/Novera-a.png',
          detail: 'auto',
        },
      },
      {
        type: ContentType.Image,
        image_url: {
          url: 'novera-creation:image/Novera-b.png',
          detail: 'auto',
        },
      }
    )
    const selected = selectShareEntries(shareEntries([message]), {
      ...options,
      scope: 'render',
      messageId: 'a',
      assetUrl: 'novera-creation:image/Novera-b.png',
    })
    expect(selected[0].text).toBe('')
    expect(selected[0].assets.map((a) => a.name)).toEqual(['Novera-b.png'])
    expect(formatsForShare(selected, true)).toContain('tiff')
    expect(formatsForShare(selected, false)).not.toContain('tiff')
    message.content[1].image_url!.url =
      'https://example.org/photo.JPG?download=1'
    expect(shareEntries([message])[0].assets[0].mime).toBe('image/jpeg')
  })
  it('does not leak reasoning-only messages or execute literal code examples', () => {
    const entries = shareEntries([
      m('a', 'assistant', '<analysis>private'),
      m('b', 'assistant', '```html\n<think>literal</think>\n```'),
    ])
    expect(entries).toHaveLength(1)
    expect(entries[0].text).toContain('<think>literal</think>')
  })
  it.each(['mp3', 'wav'])('includes stored %s music in both original-file selection and conversation exports', (format) => {
    const message = m('a', 'assistant', '')
    const url = `novera-creation:music/Novera-aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee.${format}`
    message.content = [{ type: ContentType.InputAudio, input_audio: { data: url, format: format as 'mp3' | 'wav' } }]
    const entries = shareEntries([message])
    expect(entries[0].assets[0]).toMatchObject({ url, mime: format === 'mp3' ? 'audio/mpeg' : 'audio/wav' })
    expect(selectShareEntries(entries, { ...options, scope: 'render', messageId: 'a', assetUrl: url })[0].assets).toHaveLength(1)
    expect(formatsForShare(entries, true)).toEqual(['original', 'html', 'zip'])
    message.content[0].input_audio!.data = `data:${format === 'mp3' ? 'audio/mpeg' : 'audio/wav'};base64,${url}`
    expect(shareEntries([message])[0].assets[0].url).toBe(url)
  })
})
