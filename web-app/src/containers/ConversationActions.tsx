import { useEffect, useRef, useState } from 'react'
import { ComposerIcon } from '@/components/ComposerIcon'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'
import { DeleteThreadDialog } from '@/containers/dialogs/DeleteThreadDialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useThreads } from '@/hooks/useThreads'
import { useMessages, waitForThreadMessageWrites } from '@/hooks/useMessages'
import { usePrompt } from '@/hooks/usePrompt'
import { useMessageQueue } from '@/stores/message-queue-store'
import {
  useChatAttachments,
  NEW_THREAD_ATTACHMENT_KEY,
} from '@/hooks/useChatAttachments'
import {
  conversationFormats,
  exportConversation,
  type ConversationFormat,
} from '@/modules/conversations/export'
import {
  saveConversationFile,
  printConversation,
} from '@/adapters/platform/conversation-files'

const formatLabels: Record<ConversationFormat, string> = {
  md: 'Markdown (.md)',
  txt: 'TXT (.txt)',
  json: 'JSON (.json)',
  html: 'HTML (.html)',
  csv: 'CSV (.csv)',
}

/** Only the general chat owns these actions; Cowork keeps its own lifecycle. */
export function ConversationActions({
  thread,
  busy,
  onReset,
}: {
  thread?: Thread
  busy: boolean
  onReset: () => void
}) {
  const { t } = useTranslation()
  const hub = useServiceHub()
  const [working, setWorking] = useState(false)
  const workingRef = useRef(false)
  const [deleteTarget, setDeleteTarget] = useState<Thread>()
  const [saveMenuOpen, setSaveMenuOpen] = useState(false)
  const saveTrigger = useRef<HTMLButtonElement>(null)
  const saveMenu = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!saveMenuOpen) return
    const dismissOutside = (event: Event) => {
      const target = event.target
      if (target instanceof Node &&
          !saveTrigger.current?.contains(target) && !saveMenu.current?.contains(target)) {
        setSaveMenuOpen(false)
      }
    }
    // Capture also covers clicks consumed by a surrounding composer/popover.
    document.addEventListener('pointerdown', dismissOutside, true)
    document.addEventListener('focusin', dismissOutside, true)
    return () => {
      document.removeEventListener('pointerdown', dismissOutside, true)
      document.removeEventListener('focusin', dismissOutside, true)
    }
  }, [saveMenuOpen])
  const disabled = !thread || busy || working
  const protectedSetup =
    !!thread &&
    ['What is Jan?', 'What is Novera?'].includes(thread.title) &&
    !localStorage.getItem('setup-completed')

  const save = async (format: ConversationFormat | 'pdf') => {
    if (!thread || disabled || workingRef.current) return
    workingRef.current = true
    setWorking(true)
    try {
      const stored = useMessages.getState().messages[thread.id]
      const messages = stored ?? (await hub.messages().fetchMessages(thread.id))
      const file = exportConversation(
        thread,
        messages,
        format === 'pdf' ? 'html' : format
      )
      if (format === 'pdf') await printConversation(file.content)
      else await saveConversationFile(file, hub.dialog(), hub.core())
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error))
    } finally {
      workingRef.current = false
      setWorking(false)
    }
  }

  const remove = async (id: string) => {
    let selectionChanged = useThreads.getState().currentThreadId !== id
    const unsubscribe = useThreads.subscribe((state, previous) => {
      // Our own successful deletion clears selection and removes the thread
      // together. Navigating home while it still exists is a user action.
      if (
        state.currentThreadId !== previous.currentThreadId &&
        (state.currentThreadId !== undefined || state.threads[id])
      )
        selectionChanged = true
    })
    workingRef.current = true
    setWorking(true)
    try {
      // Never let an in-flight message write recreate data after deletion.
      await waitForThreadMessageWrites(id)
      await useThreads.getState().deleteThread(id)
    } finally {
      unsubscribe()
      workingRef.current = false
      setWorking(false)
    }
    useMessageQueue.getState().clearQueue(id)
    useChatAttachments.getState().clearAttachments(id)
    useMessages.setState((state) => {
      const messages = { ...state.messages }
      delete messages[id]
      return { messages }
    })
    const current = useThreads.getState().currentThreadId
    if (selectionChanged || (current && current !== id)) return
    usePrompt.getState().setPrompt('')
    usePrompt.getState().resetHistoryNavigation()
    useChatAttachments.getState().clearAttachments(NEW_THREAD_ATTACHMENT_KEY)
    useMessageQueue.getState().clearQueue('')
    onReset()
    // The home route creates a new ID and generates a fresh title on first send.
  }

  return (
    <>
      <DropdownMenu modal={false} open={saveMenuOpen} onOpenChange={setSaveMenuOpen}>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                ref={saveTrigger}
                variant="ghost"
                size="icon-sm"
                disabled={disabled}
                aria-label={t('common:save')}
                className="composer-action"
              >
                <ComposerIcon>💾</ComposerIcon>
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent>{t('common:save')}</TooltipContent>
        </Tooltip>
        <DropdownMenuContent ref={saveMenu} align="end" className="w-64">
          <DropdownMenuLabel>{t('common:save')}</DropdownMenuLabel>
          <p className="px-2 pb-2 text-xs text-muted-foreground">
            {t('common:composer.exportHint')}
          </p>
          <DropdownMenuSeparator />
          {conversationFormats.map((format) => (
            <DropdownMenuItem
              key={format}
              disabled={disabled}
              onSelect={() => {
                void save(format)
              }}
            >
              {formatLabels[format]}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            disabled={disabled}
            onSelect={() => {
              void save('pdf')
            }}
          >
            {t('common:composer.printPdf')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon-sm"
            disabled={disabled || protectedSetup}
            aria-label={t('common:deleteThread')}
            className="composer-action composer-action-danger"
            onClick={() => {
              if (thread && !disabled) setDeleteTarget(thread)
            }}
          >
            <ComposerIcon>🗑️</ComposerIcon>
          </Button>
        </TooltipTrigger>
        <TooltipContent>{t('common:deleteThread')}</TooltipContent>
      </Tooltip>
      {deleteTarget && (
        <DeleteThreadDialog
          thread={deleteTarget}
          onDelete={remove}
          variant="project"
          open
          withoutTrigger
          onOpenChange={(open) => {
            if (!open) setDeleteTarget(undefined)
          }}
        />
      )}
    </>
  )
}
