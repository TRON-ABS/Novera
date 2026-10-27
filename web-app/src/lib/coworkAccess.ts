import { redirect } from '@tanstack/react-router'
import { route } from '@/constants/routes'
import { isCoworkEnabled } from '@/lib/version'
import { useCoworkSessions } from '@/hooks/useCoworkSessions'

/**
 * `beforeLoad` guard for every Cowork URL. On a build that does not ship
 * Cowork, a bookmarked `/cowork`, `/artifacts` or `/settings/cowork` link lands
 * on `fallback` instead of mounting a surface that has no entry point left.
 */
export function ensureCoworkEnabled(fallback: string = route.home) {
  const state = useCoworkSessions.getState()
  const selected = state.sessions.find((s) => s.id === state.currentId)
  // A newly consented folder project is available in Novera's regular desktop
  // as well; this does not expose unconfigured legacy sessions implicitly.
  const explicitProject = Boolean(selected?.folder && selected.folderAccess)
  if (!isCoworkEnabled() && !explicitProject) throw redirect({ to: fallback })
}
