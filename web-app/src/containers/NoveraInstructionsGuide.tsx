import { Link } from '@tanstack/react-router'
import { NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { route } from '@/constants/routes'
import { useTranslation } from '@/i18n/react-i18next-compat'

/** Informational only. The dashboard notebook remains the sole editor. */
export function NoveraInstructionsGuide({ onNavigate }: { onNavigate?: () => void }) {
  const { t } = useTranslation()
  const entry = `Novera · ${t('common:projects.manageInstructions')}`
  const path = `${t('common:home')} → ${entry}`
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <h2 className="text-lg font-medium">Novera</h2>
      <p className="text-sm leading-relaxed text-muted-foreground">
        {t('assistants:officialInstructions', { path })}
      </p>
      <div className="flex flex-wrap gap-2">
        {(['text', 'image', 'video'] as const).map((category) => (
          <span key={category} className="rounded-full border px-3 py-1 text-sm">{t(`chat:creation.${category}`)}</span>
        ))}
      </div>
      <p className="flex items-center gap-2 text-sm"><NotebookPen className="size-4 shrink-0" aria-hidden="true" />{entry}</p>
      <Button asChild variant="outline"><Link to={route.home} onClick={onNavigate}>{t('common:home')}</Link></Button>
    </section>
  )
}
