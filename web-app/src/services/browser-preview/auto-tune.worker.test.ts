import { afterEach, expect, it, vi } from 'vitest'
import { browserMediaWorkerTrial } from './auto-tune'

function worker() {
  return { postMessage: vi.fn(), terminate: vi.fn(), onmessage: null, onerror: null, onmessageerror: null } as unknown as Worker
}
const send = (target: Worker, data: unknown) => target.onmessage?.call(target, { data } as MessageEvent)
afterEach(() => vi.useRealTimers())

it('forwards real diffusion and VAE progress, then settles the matching short video result', async () => {
  const target = worker()
  const progress = vi.fn()
  const job = browserMediaWorkerTrial(target, { frames: 25, steps: 2 }, 'frames', new AbortController().signal, progress)
  send(target, { phase: 'loading' })
  send(target, { phase: 'generating' })
  send(target, { type: 'engine-progress', step: 1, total: 2 })
  send(target, { type: 'engine-log', message: 'generating latent video completed' })
  send(target, { type: 'engine-progress', step: 2, total: 6 })
  send(target, { phase: 'complete', count: 24, frameRgbaSha256: Array(24).fill('a'.repeat(64)) })
  expect(await job).toBeInstanceOf(Blob)
  expect(progress.mock.calls.map(([value]) => value)).toEqual([
    { stage: 'loading' }, { stage: 'generating' }, { stage: 'generating', completed: 1, total: 2 },
    { stage: 'decoding' }, { stage: 'decoding', completed: 2, total: 6 },
  ])
  expect(target.terminate).toHaveBeenCalledOnce()
  expect(target.onmessage).toBeNull()
})

it.each([
  { count: 25, frameRgbaSha256: Array(25).fill('a'.repeat(64)) },
  { count: 80, frameRgbaSha256: Array(80).fill('a'.repeat(64)) },
  { count: 24, frameRgbaSha256: Array(24).fill('invalid') },
  { count: 24, frameRgbaSha256: [] },
])('rejects an invalid completed video immediately instead of waiting for a timeout', async result => {
  const target = worker()
  const job = browserMediaWorkerTrial(target, { frames: 25 }, 'frames', new AbortController().signal)
  const check = expect(job).rejects.toThrow('Incomplete browser calibration output')
  send(target, { phase: 'complete', ...result })
  await check
  expect(target.terminate).toHaveBeenCalledOnce()
})

it('terminates a stalled worker on timeout and detaches its handlers', async () => {
  vi.useFakeTimers()
  const target = worker()
  const controller = new AbortController()
  const job = browserMediaWorkerTrial(target, { frames: 81 }, 'frames', controller.signal)
  const check = expect(job).rejects.toMatchObject({ name: 'TimeoutError' })
  setTimeout(() => controller.abort(new DOMException('signal timed out', 'TimeoutError')), 100)
  await vi.advanceTimersByTimeAsync(100)
  await check
  expect(target.terminate).toHaveBeenCalledOnce()
  expect(target.onmessage).toBeNull()
})
