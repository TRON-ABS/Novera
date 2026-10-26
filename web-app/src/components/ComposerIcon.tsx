import { Globe, Laptop, Zap, Save, Trash2, Settings2 } from 'lucide-react'

const icons = { '🌐': Globe, '💻': Laptop, '⚡': Zap, '💾': Save, '🗑️': Trash2, '⚙️': Settings2 }

/** Decorative icon; the surrounding button supplies its translated label. */
export function ComposerIcon({
  children,
}: {
  children: string
}) {
  const Icon = icons[children as keyof typeof icons]
  if (Icon) return <Icon aria-hidden="true" className="size-4" strokeWidth={1.8} />
  return (
    <span aria-hidden="true" className="composer-emoji">
      {children}
    </span>
  )
}
