import { cn } from '@/lib/utils'
import {
  useInterfaceSettings,
  ACCENT_COLORS,
} from '@/hooks/useInterfaceSettings'

export function AccentColorPicker() {
  const { accentColor, setAccentColor } = useInterfaceSettings()

  return (
    <div className="novera-accent-picker flex items-center gap-2 flex-wrap">
      {ACCENT_COLORS.map((color) => {
        const isSelected = color.value === accentColor
        return (
          <button
            key={color.value}
            title={color.name}
            aria-label={color.name}
            aria-pressed={isSelected}
            onClick={() => setAccentColor(color.value)}
            className={cn(
              'size-7 rounded-full border-2 border-secondary transition-all duration-200 cursor-pointer hover:scale-110',
              isSelected &&
                'ring-2 ring-offset-2 ring-violet-500 ring-offset-background border-none'
            )}
            style={{
              backgroundColor: color.thumb === "#3F3F46" ? 'var(--background)' : color.thumb,
            }}
          />
        )
      })}
    </div>
  )
}
