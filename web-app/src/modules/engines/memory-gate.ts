/** Ownership of live inference, independent of UI, storage and native engines. */
export type MemoryTarget = {
  kind: 'text' | 'image' | 'music' | 'video'
  provider: string
  model: string
}
export interface MemoryLease {
  release: () => void
  first: boolean
  groupId: symbol
}
type Request = {
  target: MemoryTarget
  group: MemoryTarget
  resolve: (lease: MemoryLease) => void
  reject: (error: Error) => void
  signal?: AbortSignal
  abort: () => void
}
export const memoryAbort = () =>
  Object.assign(new Error('Aborted'), { name: 'AbortError' })
const same = (a: MemoryTarget, b: MemoryTarget) =>
  a.kind === 'text' &&
  b.kind === 'text' &&
  a.provider === b.provider &&
  a.model === b.model

export class MemoryGate {
  private active = new Map<
    symbol,
    { target: MemoryTarget; group: MemoryTarget; groupId: symbol }
  >()
  private queue: Request[] = []
  targets() {
    return [...this.active.values()].map((value) => value.target)
  }
  groupFor(target: MemoryTarget) {
    return [...this.active.values()].find(
      (value) =>
        value.target.kind === target.kind &&
        value.target.provider === target.provider &&
        value.target.model === target.model
    )?.group
  }
  textGroup() {
    return [...this.active.values()].find(
      (value) => value.group.kind === 'text'
    )?.group
  }
  private compatible(group: MemoryTarget) {
    return [...this.active.values()].every((value) => same(value.group, group))
  }
  private grant(target: MemoryTarget, group: MemoryTarget): MemoryLease {
    const first = this.active.size === 0
    const token = Symbol()
    const groupId =
      [...this.active.values()].find((value) => same(value.group, group))
        ?.groupId ?? Symbol()
    this.active.set(token, { target, group, groupId })
    let released = false
    return {
      first,
      groupId,
      release: () => {
        if (released) return
        released = true
        this.active.delete(token)
        this.drain()
      },
    }
  }
  private drain() {
    while (
      this.queue.length &&
      (!this.active.size || this.compatible(this.queue[0].group))
    ) {
      const request = this.queue.shift()!
      request.signal?.removeEventListener('abort', request.abort)
      request.resolve(this.grant(request.target, request.group))
    }
  }
  acquire(
    target: MemoryTarget,
    options: {
      manual?: boolean
      reentrant?: boolean
      group?: MemoryTarget
      signal?: AbortSignal
    } = {}
  ): Promise<MemoryLease> {
    const { signal } = options
    if (signal?.aborted) return Promise.reject(memoryAbort())
    const group = options.group ?? target
    // Manual requests are tracked too: a later automatic request must not evict them.
    if (
      options.manual ||
      (options.reentrant && this.active.size && this.compatible(group))
    )
      return Promise.resolve(this.grant(target, group))
    return new Promise((resolve, reject) => {
      const request: Request = {
        target,
        group,
        resolve,
        reject,
        signal,
        abort: () => {
          this.queue = this.queue.filter((value) => value !== request)
          reject(memoryAbort())
          this.drain()
        },
      }
      this.queue.push(request)
      signal?.addEventListener('abort', request.abort, { once: true })
      this.drain()
    })
  }
}
