import { HUB_CATEGORIES, type HubCategory } from '@/modules/engines/hub-catalog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { cn } from '@/lib/utils'

export function HubCategoryExplorer({ selected, onSelect }: { selected: HubCategory; onSelect: (category: HubCategory) => void }) {
  const { t } = useTranslation()
  return <section className="rounded-2xl border bg-gradient-to-br from-cyan-500/10 via-background to-indigo-500/5 p-4 sm:p-5 space-y-4">
    <div className="space-y-1">
      <p className="text-[10px] tracking-[.2em] uppercase text-muted-foreground">Novera · Hugging Face</p>
      <h1 className="text-xl font-semibold tracking-tight">{t('hub:catalog.title')}</h1>
      <p className="max-w-2xl text-sm text-muted-foreground">{t('hub:catalog.subtitle')}</p>
    </div>
    <nav className="flex flex-wrap gap-1.5" aria-label={t('hub:catalog.categories')}>
      {HUB_CATEGORIES.map(category => <button key={category.id} type="button" aria-pressed={selected === category.id}
        onClick={() => onSelect(category.id)}
        className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-500',
          selected === category.id ? 'border-cyan-500/50 bg-cyan-500/15 text-foreground' : 'border-transparent bg-background/70 text-muted-foreground hover:border-border hover:text-foreground')}>
        <span aria-hidden="true">{category.icon}</span>{t(`hub:catalog.${category.id}`)}
      </button>)}
    </nav>
    <p className="text-[11px] text-muted-foreground">{t('hub:catalog.preparedNote')}</p>
  </section>
}
