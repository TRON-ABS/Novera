import { useMemo, useState } from 'react'
import {
  IconChevronDown,
  IconSettings,
  IconUser,
} from '@tabler/icons-react'

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ComposerIcon } from '@/components/ComposerIcon'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

import { AssistantsMenu } from '@/components/AssistantsMenu'
import { AvatarEmoji } from '@/containers/AvatarEmoji'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { ParametersSection } from '@/containers/ParametersSection'
import { useAssistant } from '@/hooks/useAssistant'
import { useModelProvider } from '@/hooks/useModelProvider'
import { paramsSettings, type ParamDef } from '@/lib/predefinedParams'
import { isPredefinedRemoteProvider } from '@/lib/providerCaps'
import { cn } from '@/lib/utils'

interface SamplerPopoverProps {
  /** Provider ID of the currently-selected model, if any. Used to scope the
   *  chip palette to a single provider's capabilities. */
  providerId?: string
  /** Currently-selected model ID. Drives model-family rejection (e.g. o1/gpt-5
   *  reasoning models reject temperature/top_p). */
  modelId?: string
  /** Optional assistant switcher. When omitted, the header shows the active
   *  assistant name as static text. */
  assistantSwitcher?: {
    assistants: Assistant[]
    currentThread: Thread | undefined
    selectedAssistantId: string | undefined
    setSelectedAssistantId: (id: string) => void
    updateCurrentThreadAssistant: (assistant: Assistant) => void
  }
}

export function SamplerPopover({
  providerId,
  modelId,
  assistantSwitcher,
}: SamplerPopoverProps) {
  const { t } = useTranslation()
  const [advanced, setAdvanced] = useState(false)
  const currentAssistant = useAssistant((s) => s.currentAssistant)
  const updateAssistant = useAssistant((s) => s.updateAssistant)
  const assistantsLoading = useAssistant((s) => s.loading)
  const providers = useModelProvider((s) => s.providers)

  const scopedProviders = useMemo(() => {
    if (providerId) {
      const p = providers.find((x) => x.provider === providerId)
      return p ? [p] : []
    }
    return providers.filter((p) => p.active)
  }, [providers, providerId])

  // The header must match the switcher's checkmark in every context:
  //  - inside a thread: the thread's assigned assistant, including "None"
  //    (model-only) which must NOT fall back to the global default;
  //  - off-thread with a switcher (home screen): the dropdown selection
  //    (selectedAssistantId), since that's what a new chat will use;
  //  - no switcher at all: the global current assistant.
  const inThread = !!assistantSwitcher?.currentThread
  const threadAssistant = assistantSwitcher?.currentThread?.assistants?.[0]
  const isThreadAssistant =
    !!threadAssistant && threadAssistant.id !== 'model-only'
  const selectedAssistant = assistantSwitcher
    ? assistantSwitcher.assistants.find(
        (a) => a.id === assistantSwitcher.selectedAssistantId
      )
    : currentAssistant
  const activeAssistant: Assistant | undefined = inThread
    ? isThreadAssistant
      ? threadAssistant
      : undefined
    : selectedAssistant

  const params = activeAssistant?.parameters ?? {}
  const samplerKeys = Object.keys(params).filter((k) => k in paramsSettings)
  const hasOverrides = samplerKeys.length > 0

  const writeParams = (next: Record<string, unknown>) => {
    if (!activeAssistant) return
    const updated = { ...activeAssistant, parameters: next }
    if (isThreadAssistant && assistantSwitcher) {
      // Sync the thread's copy so inference picks it up immediately; mirror
      // into the canonical assistant only when it still exists.
      assistantSwitcher.updateCurrentThreadAssistant(updated)
      if (assistantSwitcher.assistants.some((a) => a.id === updated.id)) {
        updateAssistant(updated)
      }
    } else {
      updateAssistant(updated)
    }
  }

  const handleToggle = (def: ParamDef) => {
    if (def.key in params) {
      const next = { ...params }
      delete next[def.key]
      writeParams(next)
    } else {
      writeParams({ ...params, [def.key]: def.value })
    }
  }

  const handleChange = (key: string, value: unknown) => {
    writeParams({ ...params, [key]: value })
  }

  const handleRemove = (key: string) => {
    const next = { ...params }
    delete next[key]
    writeParams(next)
  }

  const handleAddMany = (values: Record<string, unknown>) => {
    writeParams({ ...params, ...values })
  }

  const handleRemoveMany = (keys: string[]) => {
    const next = { ...params }
    for (const k of keys) delete next[k]
    writeParams(next)
  }

  const handleResetAll = () => {
    const next: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(params)) {
      if (!(k in paramsSettings)) next[k] = v
    }
    writeParams(next)
  }

  if (isPredefinedRemoteProvider(providerId)) return null

  const triggerLabel = assistantsLoading
    ? t('common:loading')
    : activeAssistant
      ? `${activeAssistant.name} · ${t('common:composer.advanced')}`
      : t('common:composer.modelDefaults')

  return (
    <Popover onOpenChange={() => setAdvanced(false)}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label={t('common:composer.advanced')}
              className={cn(
                'relative composer-tool',
                hasOverrides && 'composer-tool-active'
              )}
              disabled={assistantsLoading}
            >
              <ComposerIcon>⚙️</ComposerIcon>
              {hasOverrides && (
                <span
                  aria-hidden
                  className="absolute top-0.5 right-0.5 size-1.5 rounded-full bg-primary"
                />
              )}
            </Button>
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{triggerLabel}</p>
        </TooltipContent>
      </Tooltip>

      <PopoverContent
        align="start"
        side="top"
        sideOffset={8}
        collisionPadding={12}
        avoidCollisions
        className="w-[min(380px,calc(100vw-24px))] p-0 flex flex-col max-h-[var(--radix-popover-content-available-height)]"
      >
        <div className="flex items-center justify-between gap-2 px-4 pt-3 pb-2 border-b">
          <AssistantHeader
            currentAssistant={activeAssistant}
            assistantSwitcher={assistantSwitcher}
          />
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  disabled={!activeAssistant}
                  aria-label={t('common:composer.advanced')}
                  aria-expanded={advanced}
                  aria-controls="assistant-advanced-parameters"
                  onClick={() => setAdvanced((value) => !value)}
                >
                  <IconSettings
                    size={18}
                    stroke={1.7}
                    className={cn(
                      'text-muted-foreground',
                      advanced && 'text-primary'
                    )}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{t('common:composer.advanced')}</TooltipContent>
            </Tooltip>
          </div>
        </div>
        <div className="px-4 py-3 space-y-1">
          <p className="text-sm font-medium">
            {t(
              hasOverrides
                ? 'common:composer.assistantOverrides'
                : 'common:composer.modelDefaults'
            )}
          </p>
          {modelId && (
            <p className="text-xs text-muted-foreground break-all">{modelId}</p>
          )}
        </div>
        {advanced && activeAssistant && (
          <div
            id="assistant-advanced-parameters"
            className="flex-1 min-h-0 overflow-y-auto border-t px-4 py-3 space-y-3"
          >
            <p className="text-xs font-medium">
              {t('common:composer.advanced')}
            </p>
            {hasOverrides && (
              <Button variant="outline" size="sm" onClick={handleResetAll}>
                {t('common:reset')} — {t('common:composer.modelDefaults')}
              </Button>
            )}
            <ParametersSection
              params={params}
              providers={scopedProviders}
              providerId={providerId}
              modelId={modelId}
              onToggle={handleToggle}
              onChange={handleChange}
              onRemove={handleRemove}
              onAddMany={handleAddMany}
              onRemoveMany={handleRemoveMany}
            />
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

interface AssistantHeaderProps {
  currentAssistant: Assistant | undefined
  assistantSwitcher: SamplerPopoverProps['assistantSwitcher']
}

function AssistantHeader({
  currentAssistant,
  assistantSwitcher,
}: AssistantHeaderProps) {
  const { t } = useTranslation()
  const label = (
    <span className="flex items-center gap-1.5 min-w-0">
      {currentAssistant?.avatar ? (
        <AvatarEmoji
          avatar={currentAssistant.avatar}
          imageClassName="size-4 object-contain"
          textClassName="text-sm"
        />
      ) : (
        <IconUser size={14} className="text-muted-foreground" />
      )}
      <span className="text-sm font-medium truncate">
        {currentAssistant?.name ?? t('common:noAssistant')}
      </span>
    </span>
  )

  if (!assistantSwitcher) {
    return <div className="flex items-center gap-1 min-w-0">{label}</div>
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 h-7 px-2 gap-1 min-w-0"
        >
          {label}
          <IconChevronDown size={14} className="text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
        <AssistantsMenu
          selectedAssistant={assistantSwitcher.selectedAssistantId}
          setSelectedAssistant={assistantSwitcher.setSelectedAssistantId}
          currentThread={assistantSwitcher.currentThread}
          updateCurrentThreadAssistant={
            assistantSwitcher.updateCurrentThreadAssistant
          }
          assistants={assistantSwitcher.assistants}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
