import { useAppState } from '@/hooks/useAppState'
import type { EngineProgressObserver } from '@/modules/engines/contracts'

/** UI adapter: route each engine event to its owner, mirroring only the active stream. */
export const publishEngineProgress: EngineProgressObserver = ({ threadId, stats, prompt }) => {
  const state = useAppState.getState()
  const isCurrentStream = !!threadId && state.currentStreamThreadId === threadId
  if (isCurrentStream && state.loadingModel) state.updateLoadingModel(false)
  if (threadId) state.updateThreadLoadingModel(threadId, false)
  if (stats) {
    if (isCurrentStream) state.updateLiveTokenStats(stats)
    if (threadId) state.updateThreadLiveTokenStats(threadId, stats)
  }
  if (prompt) {
    if (isCurrentStream) state.updatePromptProgress(prompt)
    if (threadId) state.updateThreadPromptProgress(threadId, prompt)
  }
}
