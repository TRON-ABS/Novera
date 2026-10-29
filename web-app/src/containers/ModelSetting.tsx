import { translateSettingText } from '@/i18n/setting-text'
import { IconSettings } from '@tabler/icons-react'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDashboardPanel } from '@/hooks/useDashboardPanel'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { DynamicControllerSetting } from '@/containers/dynamicControllerSetting'
import { SamplerDefaults } from '@/containers/SamplerDefaults'
import { ChatTemplateKwargs } from '@/containers/ChatTemplateKwargs'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useServiceHub } from '@/hooks/useServiceHub'
import { cn, getModelDisplayName } from '@/lib/utils'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useAppState } from '@/hooks/useAppState'
import { paramsSettings, samplerKeysForProvider } from '@/lib/predefinedParams'
import { modelSettings } from '@/lib/predefined'

type ModelSettingProps = {
  provider: ProviderObject
  model: Model
}

/**
 * Shared model-settings form + persistence, driven by both the global window
 * (ModelSetting) and the Cowork right rail (CoworkModelPanel). Keeping the
 * handlers here avoids two copies of the debounced yaml-write / router-restart
 * logic diverging.
 */
function useModelSettingControls(model: Model, provider: ProviderObject) {
  const { updateProvider } = useModelProvider()
  const serviceHub = useServiceHub()
  const setActiveModels = useAppState((state) => state.setActiveModels)

  // Debounced stopModel — memoized so the timer survives across renders.
  // Without useMemo a fresh debounce is created every keystroke and the
  // cleanup effect below cancels the previous timer before it can fire.
  const debouncedStopModel = useMemo(
    () =>
      debounce((modelId: string) => {
        serviceHub
          .models()
          .stopModel(modelId)
          .then(() => {
            serviceHub
              .models()
              .getActiveModels()
              .then((models) => setActiveModels(models || []))
          })
      }, 500),
    [serviceHub, setActiveModels]
  )

  // Coalesce rapid sidebar edits into a single yaml-write + router-restart.
  // Each call merges into a per-model accumulator; the debounced flush writes
  // and clears it. Avoids a flurry of slider drags rewriting model.yml + bouncing
  // the router on every keystroke.
  const pendingPatchesRef = useRef<
    Map<string, Record<string, string | number | boolean | null | undefined>>
  >(new Map())
  const rollbackSettingsRef = useRef<Map<string, Model['settings'] | undefined>>(
    new Map()
  )
  const flushPendingPatches = useMemo(
    () =>
      debounce(() => {
        const patches = pendingPatchesRef.current
        pendingPatchesRef.current = new Map()
        for (const [modelId, patch] of patches) {
          serviceHub
            .models()
            .updateModelSettings(modelId, patch)
            .then(() => {
              rollbackSettingsRef.current.delete(modelId)
            })
            .catch((e) => {
              const previousSettings = rollbackSettingsRef.current.get(modelId)
              rollbackSettingsRef.current.delete(modelId)
              const latestProvider = useModelProvider
                .getState()
                .getProviderByName(provider.provider)
              if (latestProvider) {
                const modelIndex = latestProvider.models.findIndex(
                  (m) => m.id === modelId
                )
                if (modelIndex !== -1) {
                  const revertedModels = [...latestProvider.models]
                  revertedModels[modelIndex] = {
                    ...revertedModels[modelIndex],
                    settings: previousSettings,
                  } as Model
                  useModelProvider.getState().updateProvider(provider.provider, {
                    models: revertedModels,
                  })
                }
              }
              console.error('Failed to persist model settings', e)
            })
        }
      }, 1500),
    [provider.provider, serviceHub]
  )
  const debouncedPersistModelSettings = (
    modelId: string,
    patch: Record<string, string | number | boolean | null | undefined>,
    previousSettings: Model['settings'] | undefined
  ) => {
    if (!rollbackSettingsRef.current.has(modelId)) {
      rollbackSettingsRef.current.set(modelId, previousSettings)
    }
    const existing = pendingPatchesRef.current.get(modelId) ?? {}
    pendingPatchesRef.current.set(modelId, { ...existing, ...patch })
    flushPendingPatches()
  }

  useEffect(() => {
    return () => {
      // Flush — not cancel — so a pending ctx_len/ngl edit still gets
      // written to model.yml and the router restarted after the window closes.
      flushPendingPatches.flush()
      debouncedStopModel.flush()
    }
  }, [debouncedStopModel, flushPendingPatches])

  const handleSettingChange = (
    key: string,
    value: string | boolean | number
  ) => {
    if (!provider) return

    // Create a copy of the model with updated settings
    const updatedModel = {
      ...model,
      settings: {
        ...model.settings,
        [key]: {
          ...(model.settings?.[key] != null ? model.settings?.[key] : {}),
          controller_props: {
            ...(model.settings?.[key]?.controller_props ?? {}),
            value: value,
          },
        },
      },
    }

    // Find the model index in the provider's models array
    const modelIndex = provider.models.findIndex((m) => m.id === model.id)

    if (modelIndex !== -1) {
      // Create a copy of the provider's models array
      const updatedModels = [...provider.models]

      // Update the specific model in the array
      updatedModels[modelIndex] = updatedModel as Model

      // Update the provider with the new models array
      updateProvider(provider.provider, {
        models: updatedModels,
      })

      // Call debounced stopModel only when updating settings that require restart,
      // and only if the model is currently running
      if (
        key === 'ctx_len' ||
        key === 'ngl' ||
        key === 'chat_template' ||
        key === 'offload_mmproj' ||
        key === 'batch_size' ||
        key === 'performance_mode' ||
        key === 'ngram_speculation' ||
        key === 'cpu_moe' ||
        key === 'n_cpu_moe' ||
        key === 'n_cpu_ffn'
      ) {
        // Check if model is running before stopping it
        serviceHub
          .models()
          .getActiveModels()
          .then((activeModels) => {
            if (activeModels.includes(model.id)) {
              debouncedStopModel(model.id)
            }
          })
      }

      // In router mode the router reads args from `router.preset.ini` (built
      // from `model.yml`) — Zustand alone has no effect on inference. Persist
      // mappable keys to disk + restart the router so the next load uses the
      // new args. Non-mappable keys are filtered inside the extension.
      if (provider.provider === 'llamacpp') {
        debouncedPersistModelSettings(model.id, { [key]: value }, model.settings)
      }
    }
  }

  // Chat-template kwargs are a per-request concern (sent as chat_template_kwargs),
  // not a router preset arg — persist to the store only, like `reasoning`.
  const handleTemplateKwargsChange = (
    value: Record<string, boolean | number | string>
  ) => {
    if (!provider) return
    const modelIndex = provider.models.findIndex((m) => m.id === model.id)
    if (modelIndex === -1) return
    const existing = model.settings?.chat_template_kwargs
    const updatedModel = {
      ...model,
      settings: {
        ...model.settings,
        chat_template_kwargs: {
          key: 'chat_template_kwargs',
          title: 'Chat template options',
          description: '',
          controller_type: 'object',
          ...(existing ?? {}),
          controller_props: {
            ...(existing?.controller_props ?? {}),
            value,
          },
        },
      },
    } as unknown as Model
    const updatedModels = [...provider.models]
    updatedModels[modelIndex] = updatedModel
    updateProvider(provider.provider, { models: updatedModels })
  }

  const handleEngineSettingChange = (
    key: string,
    value: string | boolean | number
  ) => {
    if (!provider) return
    const newSettings = provider.settings.map((s) =>
      s.key === key
        ? {
            ...s,
            controller_props: { ...s.controller_props, value },
          }
        : s
    )
    serviceHub.providers().updateSettings(provider.provider, newSettings)
    updateProvider(provider.provider, { settings: newSettings })
  }

  const fitEnabled =
    provider.settings?.find((s) => s.key === 'fit')?.controller_props?.value ===
    true
  const fitCtxSetting = provider.settings?.find((s) => s.key === 'fit_ctx')

  return {
    handleSettingChange,
    handleTemplateKwargsChange,
    handleEngineSettingChange,
    fitEnabled,
    fitCtxSetting,
  }
}

/** The settings body, shared by the global window and the Cowork rail. */
export function ModelSettingFields({ model, provider }: ModelSettingProps) {
  const { t } = useTranslation()
  const {
    handleSettingChange,
    handleTemplateKwargsChange,
    handleEngineSettingChange,
    fitEnabled,
    fitCtxSetting,
  } = useModelSettingControls(model, provider)

  return (
    <div className="novera-model-settings-fields px-4 space-y-8 pb-4 flex-1 min-h-0 overflow-y-auto">
          {provider.provider === 'llamacpp' && (
            <SpecDraftPanel modelId={model.id} />
          )}
          {provider.provider === 'llamacpp' && model.embedding !== true && (
            <ChatTemplateKwargs
              model={model}
              onChange={handleTemplateKwargsChange}
            />
          )}
          {['llamacpp', 'mlx', 'transformers'].includes(provider.provider) &&
            model.embedding !== true && (
              <SamplerDefaults
                model={model}
                keys={samplerKeysForProvider(provider.provider)}
                onChange={handleSettingChange}
              />
            )}
          {fitEnabled && fitCtxSetting && (
            <div key="fit_ctx" className="space-y-2">
              <div className="flex items-start justify-between gap-8">
                <div className="mb-1 truncate">
                  <span title={translateSettingText(fitCtxSetting.title, t)} className="font-medium">
                    {translateSettingText(fitCtxSetting.title, t)}
                  </span>
                </div>
                <DynamicControllerSetting
                  key={fitCtxSetting.key}
                  title={translateSettingText(fitCtxSetting.title, t)}
                  description={translateSettingText(fitCtxSetting.description, t)}
                  controllerType={fitCtxSetting.controller_type}
                  controllerProps={fitCtxSetting.controller_props}
                  onChange={(newValue) =>
                    handleEngineSettingChange('fit_ctx', newValue)
                  }
                />
              </div>
              <p className="text-muted-foreground leading-normal text-xs">
                {translateSettingText(fitCtxSetting.description, t)}
              </p>
            </div>
          )}
          {(() => {
            return Object.entries({
              ...(provider.provider === 'llamacpp'
                ? {
                    performance_mode: modelSettings.performance_mode,
                    ngram_speculation: modelSettings.ngram_speculation,
                  }
                : {}),
              ...model.settings,
            })
          .reduce<[string, unknown][]>((acc, entry) => {
            if (entry[0] === 'reasoning') return acc
            // Rendered by the dedicated ChatTemplateKwargs section above.
            if (entry[0] === 'chat_template_kwargs') return acc
            // Removed in v15 migration; defend against any pre-migration
            // localStorage state that still carries the orphan entry.
            if (entry[0] === 'auto_increase_ctx_len') return acc
            if (fitEnabled && entry[0] === 'ctx_len') return acc
            // Sampling params live in the composer popover, not the sidebar.
            if (entry[0] in paramsSettings) return acc
            acc.push(entry)
            return acc
          }, [])
          .filter(([key]) => {
            if (
              provider.provider !== 'llamacpp' &&
              ['performance_mode', 'ngram_speculation'].includes(key)
            ) return false
            // MLX models only support context size setting
            if (provider.provider === 'mlx' || provider.provider === 'transformers') {
              return key === 'ctx_len'
            }
            return true
          })
          .map(([key, value]) => {
            const config = value as ProviderSetting
            return (
              <div key={key} className="space-y-2">
                <div
                  className={cn(
                    'flex items-start justify-between gap-8',
                    (key === 'chat_template' ||
                      key === 'override_tensor_buffer_t' ||
                      config.controller_type === 'dropdown') &&
                      'flex-col gap-1 w-full'
                  )}
                >
                  <div className="mb-1 truncate">
                    <span title={translateSettingText(config.title, t)} className="font-medium">{translateSettingText(config.title, t)}</span>
                  </div>
                  <DynamicControllerSetting
                    key={config.key}
                    title={translateSettingText(config.title, t)}
                    description={translateSettingText(config.description, t)}
                    controllerType={config.controller_type}
                    disabledReason={
                      fitEnabled && key === 'ngl'
                        ? t('common:modelSettings.nglDisabledByFit')
                        : undefined
                    }
                    controllerProps={{
                      ...config.controller_props,
                      value: config.controller_props?.value,
                    }}
                    onChange={(newValue) => handleSettingChange(key, newValue)}
                  />
                </div>
                <p className="text-muted-foreground leading-normal text-xs">
                  {translateSettingText(config.description, t)}
                </p>
              </div>
            )
          })
          })()}
    </div>
  )
}

export function ModelSetting({ model, provider }: ModelSettingProps) {
  const { t } = useTranslation()
  return (
    <Tooltip>
      <TooltipTrigger asChild>
    <Button type="button" variant="ghost" size="icon-xs"
      aria-label={t('common:modelSettings.label')}
      onClick={() => useDashboardPanel.getState().openModelSettings(model, provider)}>
      <IconSettings size={18} className="text-muted-foreground" />
    </Button>
      </TooltipTrigger>
      <TooltipContent>{t('common:modelSettings.label')}</TooltipContent>
    </Tooltip>
  )
}

/** A single global window survives the originating model menu being unmounted. */
export function ModelSettingWindow() {
  const { t } = useTranslation()
  const info = useDashboardPanel(state => state.modelSettings)
  const panel = useDashboardPanel(state => state.panel)
  const latestProvider = useModelProvider(state => info ? state.getProviderByName(info.provider.provider) : undefined)
  if (!info || panel !== 'model-settings') return null
  const provider = latestProvider ?? info.provider
  const model = provider.models.find(value => value.id === info.model.id) ?? info.model
  return (
    <Dialog open modal={false} onOpenChange={open => {
      if (!open) useDashboardPanel.getState().closePanel('model-settings')
    }}>
      <DialogContent docked className="novera-model-settings flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="p-4 border-b border-cyan-400/30 mb-4 shrink-0">
          <DialogTitle>
            {t('common:modelSettings.title', {
              modelId: getModelDisplayName(model),
            })}
          </DialogTitle>
          <DialogDescription className="text-xs leading-normal">
            {t('common:modelSettings.description')}
          </DialogDescription>
        </DialogHeader>
        <ModelSettingFields model={model} provider={provider} />
      </DialogContent>
    </Dialog>
  )
}

type SpecDraftInfo = {
  mtp_layers: number
  mtp: boolean
  spec_draft_n_max?: number
  spec_draft_n_min?: number
  spec_draft_p_min?: number
}

export function SpecDraftPanel({ modelId }: { modelId: string }) {
  const { t } = useTranslation()
  const serviceHub = useServiceHub()
  const [info, setInfo] = useState<SpecDraftInfo | null>(null)

  useEffect(() => {
    let active = true
    serviceHub
      .models()
      .getMtpInfo(modelId)
      .then((v) => {
        if (active) setInfo(v)
      })
      .catch(() => {
        if (active) setInfo({ mtp_layers: 0, mtp: false })
      })
    return () => {
      active = false
    }
  }, [modelId, serviceHub])

  const persist = useCallback(
    async (patch: {
      mtp?: boolean
      spec_draft_n_max?: number | null
      spec_draft_n_min?: number | null
      spec_draft_p_min?: number | null
    }) => {
      try {
        await serviceHub.models().updateMtpSettings(modelId, patch)
      } catch (e) {
        console.error('Failed to update MTP settings', e)
      }
    },
    [modelId, serviceHub]
  )

  if (!info || info.mtp_layers <= 0) return null

  const enabled = info.mtp === true

  const updateNumber = (
    key: 'spec_draft_n_max' | 'spec_draft_n_min' | 'spec_draft_p_min',
    raw: string
  ) => {
    const trimmed = raw.trim()
    if (trimmed.length === 0) {
      setInfo({ ...info, [key]: undefined })
      void persist({ [key]: null })
      return
    }
    const n = Number(trimmed)
    if (!Number.isFinite(n)) return
    setInfo({ ...info, [key]: n })
    void persist({ [key]: n })
  }

  return (
    <div className="space-y-3">
      <div className="font-medium">
        {t('common:modelSettings.specDraft.section')}
      </div>

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-8">
          <div className="mb-1 truncate">
            <span className="font-medium">
              {t('common:modelSettings.specDraft.enable')}
            </span>
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={(v) => {
              setInfo({ ...info, mtp: v })
              void persist({ mtp: v })
            }}
          />
        </div>
        <p className="text-muted-foreground leading-normal text-xs">
          {t('common:modelSettings.specDraft.enableDescription')}
        </p>
      </div>

      {enabled && (
        <>
          <NumberRow
            label={t('common:modelSettings.specDraft.nMax')}
            description={t('common:modelSettings.specDraft.nMaxDescription')}
            placeholder="16"
            value={info.spec_draft_n_max}
            min={1}
            step={1}
            onChange={(raw) => updateNumber('spec_draft_n_max', raw)}
          />
          <NumberRow
            label={t('common:modelSettings.specDraft.nMin')}
            description={t('common:modelSettings.specDraft.nMinDescription')}
            placeholder="0"
            value={info.spec_draft_n_min}
            min={0}
            step={1}
            onChange={(raw) => updateNumber('spec_draft_n_min', raw)}
          />
          <NumberRow
            label={t('common:modelSettings.specDraft.pMin')}
            description={t('common:modelSettings.specDraft.pMinDescription')}
            placeholder="0.75"
            value={info.spec_draft_p_min}
            min={0}
            max={1}
            step={0.05}
            onChange={(raw) => updateNumber('spec_draft_p_min', raw)}
          />
        </>
      )}
    </div>
  )
}

function NumberRow({
  label,
  description,
  placeholder,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string
  description: string
  placeholder: string
  value: number | undefined
  min?: number
  max?: number
  step?: number
  onChange: (raw: string) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start justify-between gap-8">
        <div className="mb-1 truncate">
          <span className="font-medium">{label}</span>
        </div>
        <Input
          type="number"
          className="w-32"
          placeholder={placeholder}
          value={value ?? ''}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      <p className="text-muted-foreground leading-normal text-xs">
        {description}
      </p>
    </div>
  )
}
