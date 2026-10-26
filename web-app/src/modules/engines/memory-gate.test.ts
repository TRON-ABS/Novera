import { describe, it, expect } from 'vitest'
import { MemoryGate, type MemoryTarget } from './memory-gate'
const text: MemoryTarget = { kind: 'text', provider: 'llamacpp', model: 'a' }
const image: MemoryTarget = { kind: 'image', provider: 'sdcpp', model: 'flux' }
const video: MemoryTarget = {
  kind: 'video',
  provider: 'diffusers',
  model: 'video',
}
describe('local inference ownership', () => {
  it.each([
    [text, image],
    [image, text],
    [text, video],
    [video, text],
    [image, video],
    [video, image],
  ])('waits for the current %j before switching to %j', async (from, to) => {
    const gate = new MemoryGate()
    const first = await gate.acquire(from)
    let started = false
    const next = gate.acquire(to).then((lease) => {
      started = true
      return lease
    })
    await Promise.resolve()
    expect(started).toBe(false)
    first.release()
    const lease = await next
    expect(started).toBe(true)
    lease.release()
  })
  it('allows text/image/video simultaneously in manual mode and protects them from a later automatic eviction', async () => {
    const gate = new MemoryGate()
    const leases = await Promise.all(
      [text, image, video].map((target) =>
        gate.acquire(target, { manual: true })
      )
    )
    expect(gate.targets()).toHaveLength(3)
    let switched = false
    const next = gate.acquire({ ...text, model: 'b' }).then((lease) => {
      switched = true
      return lease
    })
    leases[0].release()
    leases[1].release()
    await Promise.resolve()
    expect(switched).toBe(false)
    leases[2].release()
    ;(await next).release()
    expect(gate.targets()).toHaveLength(0)
  })
  it('shares an existing text model but queues new work fairly and permits nested model loads', async () => {
    const gate = new MemoryGate()
    const first = await gate.acquire(text)
    const shared = await gate.acquire(text)
    expect(shared.first).toBe(false)
    expect(shared.groupId).toBe(first.groupId)
    const queuedImage = gate.acquire(image)
    let lateStarted = false
    const late = gate.acquire(text).then((lease) => {
      lateStarted = true
      return lease
    })
    const nested = await gate.acquire(text, { reentrant: true })
    first.release()
    shared.release()
    await Promise.resolve()
    expect(lateStarted).toBe(false)
    nested.release()
    const picture = await queuedImage
    await Promise.resolve()
    expect(lateStarted).toBe(false)
    picture.release()
    ;(await late).release()
  })
  it('cancels a waiting request without touching the active generation or leaking ownership', async () => {
    const gate = new MemoryGate()
    const active = await gate.acquire(image)
    const controller = new AbortController()
    const pending = gate.acquire(text, { signal: controller.signal })
    controller.abort()
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' })
    expect(gate.targets()).toEqual([image])
    active.release()
    active.release()
    expect(gate.targets()).toHaveLength(0)
  })
})
