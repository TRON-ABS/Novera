import type { ReactNode } from 'react'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

/** The wrapper also receives hover when its child button is disabled. */
export function ActionTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip delayDuration={250}>
      <TooltipTrigger asChild><span className="inline-flex">{children}</span></TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
