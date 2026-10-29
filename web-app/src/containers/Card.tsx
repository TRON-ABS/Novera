import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

type CardProps = {
  title?: string
  children?: ReactNode
  header?: ReactNode
}

type CardItemProps = {
  title?: string | ReactNode
  description?: string | ReactNode
  descriptionOutside?: string | ReactNode
  align?: 'start' | 'center' | 'end'
  actions?: ReactNode
  column?: boolean
  className?: string
  classNameWrapperAction?: string
}

export function CardItem({
  title,
  description,
  descriptionOutside,
  className,
  classNameWrapperAction,
  align = 'center',
  column,
  actions,
}: CardItemProps) {
  return (
    <>
      <div
        className={cn(
          'novera-settings-row flex justify-between mt-2 first:mt-0 border-b border-border/40 pb-3 last:border-none last:pb-0 gap-8',
          descriptionOutside && 'border-0',
          align === 'start' && 'items-start',
          align === 'center' && 'items-center',
          align === 'end' && 'items-end',
          column && 'flex-col gap-y-0 items-start',
          className
        )}
      >
        <div className="novera-settings-copy space-y-1.5">
          <h3 className="font-medium text-foreground">{title}</h3>
          {description && (
            <span className="text-muted-foreground leading-normal">
              {description}
            </span>
          )}
        </div>
        {actions && (
          <div
            className={cn(
              'novera-settings-action shrink-0',
              classNameWrapperAction,
              column && 'w-full'
            )}
          >
            {actions}
          </div>
        )}
      </div>
      {descriptionOutside && (
        <span className="text-muted-foreground leading-normal">
          {descriptionOutside}
        </span>
      )}
    </>
  )
}

export function Card({ title, children, header }: CardProps) {
  return (
    <div className="novera-settings-card bg-card p-4 rounded-lg text-muted-foreground w-full">
      {title && (
        <h2 className="text-foreground font-studio font-medium text-base mb-4">
          {title}
        </h2>
      )}
      {header && header}
      {children}
    </div>
  )
}
