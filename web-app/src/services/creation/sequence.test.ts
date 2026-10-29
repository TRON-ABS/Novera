import { describe, expect, it, vi } from 'vitest'
import type { UIMessageChunk } from 'ai'
import { generationSequence } from './sequence'

async function consume(stream: ReadableStream<UIMessageChunk>) {
  const output: UIMessageChunk[] = []
  for await (const chunk of stream) output.push(chunk)
  return output
}

describe('sequential media generations', () => {
  it('waits for cleanup and emits one message containing every result', async () => {
    let created = 0
    const cleaned: number[] = []
    const finish = vi.fn()
    const stream = generationSequence(3, (_signal, done) => {
      const index = ++created
      expect(cleaned).toHaveLength(index - 1)
      return new ReadableStream<UIMessageChunk>({
        async start(controller) {
          controller.enqueue({ type: 'start', messageId: String(index) })
          controller.enqueue({ type: 'file', mediaType: 'image/png', url: `image-${index}`, providerMetadata: { novera: { seed: index } } })
          controller.enqueue({ type: 'finish', finishReason: 'stop' })
          controller.close()
          await Promise.resolve()
          cleaned.push(index)
          done()
        },
      })
    }, undefined, finish)
    const chunks = await consume(stream)
    expect(chunks.filter(chunk => chunk.type === 'start')).toHaveLength(1)
    expect(chunks.filter(chunk => chunk.type === 'finish')).toHaveLength(1)
    expect(chunks.filter(chunk => chunk.type === 'file').map(chunk => chunk.url)).toEqual(['image-1', 'image-2', 'image-3'])
    expect(cleaned).toEqual([1, 2, 3])
    expect(finish).toHaveBeenCalledTimes(1)
  })

  it('cancels the active job and does not start the next one', async () => {
    const abort = new AbortController(), finish = vi.fn()
    let count = 0
    const stream = generationSequence(10, (signal, done) => {
      count++
      return new ReadableStream<UIMessageChunk>({
        start(controller) {
          signal!.addEventListener('abort', () => { controller.error(new DOMException('Aborted', 'AbortError')); done() }, { once: true })
          controller.enqueue({ type: 'start', messageId: 'only' })
        },
      })
    }, abort.signal, finish)
    const reader = stream.getReader()
    expect((await reader.read()).value?.type).toBe('start')
    abort.abort()
    await expect(reader.read()).rejects.toMatchObject({ name: 'AbortError' })
    await vi.waitFor(() => expect(finish).toHaveBeenCalledTimes(1))
    expect(count).toBe(1)
  })

  it('stops after an error while retaining the result already streamed', async () => {
    const finish = vi.fn()
    let count = 0
    const stream = generationSequence(3, (_signal, done) => new ReadableStream<UIMessageChunk>({
      start(controller) {
        count++
        if (count === 2) controller.error(new Error('native job failed'))
        else { controller.enqueue({ type: 'file', mediaType: 'audio/wav', url: 'saved.wav' }); controller.close() }
        done()
      },
    }), undefined, finish)
    const reader = stream.getReader()
    expect((await reader.read()).value).toMatchObject({ type: 'file', url: 'saved.wav' })
    await expect(reader.read()).rejects.toThrow('native job failed')
    expect(count).toBe(2)
    expect(finish).toHaveBeenCalledTimes(1)
  })

  it.each([undefined, 0, 11, -1, 1.5, NaN, Infinity])('defaults an invalid saved count %s to one job', async value => {
    const finish = vi.fn(), create = vi.fn((_signal, done) => new ReadableStream<UIMessageChunk>({ start(controller) { controller.close(); done() } }))
    await consume(generationSequence(value, create, undefined, finish))
    expect(create).toHaveBeenCalledTimes(1)
    expect(finish).toHaveBeenCalledTimes(1)
  })
})
