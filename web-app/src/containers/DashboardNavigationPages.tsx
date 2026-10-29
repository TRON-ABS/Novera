import { useEffect, useState } from 'react'
import { RouterProvider } from '@tanstack/react-router'
import type { AnyRoute } from '@tanstack/react-router'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { createDashboardRouter } from '@/lib/dashboard-navigation-router'

const pages = import.meta.glob<{ Route: AnyRoute }>([
  '../routes/settings/**/*.tsx', '../routes/hub/**/*.tsx',
  '!../routes/**/__tests__/**',
])

export default function DashboardNavigationPages({ panel, onExit, initialPath }: {
  panel: 'models' | 'settings'
  onExit: (model?: ThreadModel) => void
  initialPath?: string
}) {
  const { t } = useTranslation()
  const [router, setRouter] = useState<Awaited<ReturnType<typeof createDashboardRouter>>>()
  const [failed, setFailed] = useState(false)
  useEffect(() => {
    let active = true
    void createDashboardRouter(initialPath ?? (panel === 'models' ? '/hub/' : '/settings/general'), onExit, pages)
      .then(value => { if (active) setRouter(value) })
      .catch(() => { if (active) setFailed(true) })
    return () => { active = false }
  }, [panel, onExit, initialPath])
  if (failed) return <p className="p-4" role="alert">{t('common:error')}</p>
  if (!router) return <p className="p-4" role="status">{t('common:loading')}</p>
  return <div className="novera-dashboard-pages"><RouterProvider router={router} /></div>
}
