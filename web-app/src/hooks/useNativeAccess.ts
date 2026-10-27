import { create } from 'zustand'

export type FolderAccess = 'read' | 'ask' | 'allow'
type Decision = 'allow-once' | 'allow-always' | 'deny'
type Request = {
  id: string
  owner: string
  kind: 'shell' | 'folder'
  details: string
  settle: (approved: boolean) => void
}
type State = {
  pending: Request[]
  /** Runtime grants only: restarting the app asks again. Never inherit MCP trust. */
  grants: Record<string, boolean>
  generation: Record<string, number>
  request: (owner: string, kind: Request['kind'], details: string) => Promise<boolean>
  resolve: (id: string, decision: Decision) => void
  cancel: (owner: string) => void
  reset: (owner: string) => void
}

export const useNativeAccess = create<State>((set, get) => ({
  pending: [],
  grants: {},
  generation: {},
  request: (owner, kind, details) => {
    const key = JSON.stringify([owner, kind])
    if (get().grants[key]) return Promise.resolve(true)
    return new Promise((settle) => {
      const id = crypto.randomUUID()
      set((s) => ({ pending: [...s.pending, { id, owner, kind, details, settle }] }))
    })
  },
  resolve: (id, decision) => {
    const entry = get().pending.find((p) => p.id === id)
    if (!entry) return
    set((s) => ({
      pending: s.pending.filter((p) => p.id !== id),
      grants: decision === 'allow-always'
        ? { ...s.grants, [JSON.stringify([entry.owner, entry.kind])]: true }
        : s.grants,
    }))
    entry.settle(decision !== 'deny')
  },
  cancel: (owner) => {
    const entries = get().pending.filter((p) => p.owner === owner)
    set((s) => ({ pending: s.pending.filter((p) => p.owner !== owner), generation: { ...s.generation, [owner]: (s.generation[owner] ?? 0) + 1 } }))
    for (const entry of entries) entry.settle(false)
  },
  reset: (owner) => {
    get().cancel(owner)
    set((s) => ({ grants: Object.fromEntries(Object.entries(s.grants)
      .filter(([key]) => JSON.parse(key)[0] !== owner)) }))
  },
}))
