import { beforeEach, describe, expect, it, vi } from 'vitest'
vi.mock('@/lib/backendStorage', () => ({ backendStorage: { getItem: async () => null, setItem: async () => {}, removeItem: async () => {} } }))
import { nativeToolAccess } from '../nativeToolAccess'
import { useNativeAccess } from '@/hooks/useNativeAccess'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'

function project(access: 'read' | 'ask' | 'allow' = 'read') {
  const state = useCoworkSessions.getState()
  const id = state.createSession()
  state.setFolder(id, 'C:/project', access)
  return id
}
function decide(decision: 'deny' | 'allow-once' | 'allow-always') {
  const request = useNativeAccess.getState().pending[0]
  expect(request).toBeDefined()
  useNativeAccess.getState().resolve(request.id, decision)
}
beforeEach(() => {
  for (const request of useNativeAccess.getState().pending) useNativeAccess.getState().cancel(request.owner)
  useNativeAccess.setState({ pending: [], grants: {}, generation: {} })
  useCoworkSessions.setState({ sessions: [], currentId: null })
})
describe('native tool consent', () => {
  it('holds the first shell command until the user chooses and defaults to denial on cancel', async () => {
    const pending = nativeToolAccess('chat', 'shell', { command: 'echo hello' })
    expect(useNativeAccess.getState().pending[0].details).toContain('echo hello')
    useNativeAccess.getState().cancel('chat')
    expect(await pending).toEqual({ allowed: false, writable: false })
  })
  it('allows one shell command without granting the next one', async () => {
    const first = nativeToolAccess('chat', 'shell', {})
    decide('allow-once')
    expect(await first).toEqual({ allowed: true, writable: false })
    const second = nativeToolAccess('chat', 'shell', {})
    decide('deny')
    expect((await second).allowed).toBe(false)
  })
  it('limits ongoing shell consent to the owner and revokes it on reset', async () => {
    const first = nativeToolAccess('one', 'shell', {})
    decide('allow-always'); await first
    expect((await nativeToolAccess('one', 'shell', {})).allowed).toBe(true)
    const other = nativeToolAccess('two', 'shell', {})
    decide('deny'); expect((await other).allowed).toBe(false)
    useNativeAccess.getState().reset('one')
    const again = nativeToolAccess('one', 'shell', {})
    decide('deny'); expect((await again).allowed).toBe(false)
  })
  it('keeps a readonly folder protected even after shell approval', async () => {
    const id = project()
    const pending = nativeToolAccess(id, 'shell', {}, 'C:/project')
    decide('allow-once')
    expect(await pending).toEqual({ allowed: true, writable: false })
    expect(await nativeToolAccess(id, 'write', {}, 'C:/project')).toEqual({ allowed: true, writable: false })
  })
  it('asks separately for changes and shell access, and does not reuse a one-off write approval', async () => {
    const id = project('ask')
    const pending = nativeToolAccess(id, 'shell', {}, 'C:/project')
    decide('allow-always')
    await vi.waitFor(() => expect(useNativeAccess.getState().pending[0]?.kind).toBe('folder'))
    decide('allow-once')
    expect(await pending).toEqual({ allowed: true, writable: true })
    const edit = nativeToolAccess(id, 'edit', {}, 'C:/project')
    decide('deny'); expect((await edit).allowed).toBe(false)
  })
  it('only grants the exact explicitly selected folder and keeps ask-mode monitors readonly', async () => {
    const id = project('allow')
    expect((await nativeToolAccess(id, 'write', {}, 'C:/project')).writable).toBe(true)
    expect((await nativeToolAccess(id, 'write', {}, 'C:/other')).writable).toBe(false)
    useCoworkSessions.getState().setFolder(id, 'C:/project', 'ask')
    const monitor = nativeToolAccess(id, 'monitor', {}, 'C:/project')
    decide('allow-once')
    expect(await monitor).toEqual({ allowed: true, writable: false })
  })
  it('invalidates pending consent when the project changes or is deleted', async () => {
    const id = project('ask')
    const edit = nativeToolAccess(id, 'edit', {}, 'C:/project')
    useCoworkSessions.getState().setFolder(id, 'C:/other', 'allow')
    expect((await edit).allowed).toBe(false)
    const shell = nativeToolAccess(id, 'shell', {}, 'C:/other')
    useCoworkSessions.getState().deleteSession(id)
    expect((await shell).allowed).toBe(false)
  })
  it('preserves folder projects without messages when creating and pruning sessions', () => {
    const first = project()
    const second = useCoworkSessions.getState().createSession()
    expect(second).not.toBe(first)
    useCoworkSessions.getState().pruneEmptySessions([])
    expect(useCoworkSessions.getState().sessions.some((s) => s.id === first)).toBe(true)
  })
})
