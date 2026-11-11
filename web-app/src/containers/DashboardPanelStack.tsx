import { useDashboardPanel } from '@/hooks/useDashboardPanel'
import { useDashboardPanelPosition } from '@/hooks/useDashboardPanelPosition'

export function DashboardPanelStack() {
  const open = useDashboardPanel(state => state.panels.length > 0)
  const { style } = useDashboardPanelPosition(open, true)
  return <div className="novera-dashboard-stack" data-dashboard-stack data-auto-tune-panel style={style} />
}
