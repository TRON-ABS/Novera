import { useNativeAccess } from '@/hooks/useNativeAccess'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'

/** Called at the native invocation boundary, shared by parents and children. */
export async function nativeToolAccess(owner: string, tool: string, input: unknown, folder?: string | null) {
  const session = useCoworkSessions.getState().sessions.find((s) => s.id === owner)
  const access = folder && session?.folder === folder ? session.folderAccess ?? 'read' : 'read'
  const details = JSON.stringify({ folder, tool, arguments: input }, null, 2)
  const requests = useNativeAccess.getState()
  const generation = requests.generation[owner] ?? 0
  if ((tool === 'shell' || tool === 'monitor') && !await requests.request(owner, 'shell', details)) {
    return { allowed: false, writable: false }
  }
  if ((useNativeAccess.getState().generation[owner] ?? 0) !== generation) return { allowed: false, writable: false }
  const mayChangeFiles = ['write', 'edit', 'shell'].includes(tool)
  let writable = Boolean(folder && access === 'allow')
  if (folder && access === 'ask' && mayChangeFiles) {
    if (!await useNativeAccess.getState().request(owner, 'folder', details)) return { allowed: false, writable: false }
    writable = true
  }
  // Monitors in ask mode stay read-only: their later background executions
  // cannot inherit a one-off approval to edit a project indefinitely.
  const alive = (useNativeAccess.getState().generation[owner] ?? 0) === generation
  return { allowed: alive, writable: alive && writable }
}
