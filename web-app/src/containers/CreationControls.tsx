import { useEffect, useState } from 'react'
import { IconPhoto, IconVideo, IconAdjustments } from '@tabler/icons-react'
import { useMediaLibrary, selectMediaProfile } from '@/hooks/useMediaLibrary'
import { useCreation } from '@/hooks/useCreation'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useTranslation } from '@/i18n/react-i18next-compat'
import type { OutputMode } from '@/modules/engines/creation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { isPlatformTauri } from '@/lib/platform/utils'
import { useModelProvider } from '@/hooks/useModelProvider'
import { getProviderTitle } from '@/lib/utils'
import { mediaPreset } from '@/constants/mediaProviders'
import { modelModalities } from '@/modules/engines/model-modalities'
import { CreationInstallButton } from './CreationInstall'
import { klein4bRecommendation } from '@/constants/creationRecommendations'

export function CreationControls({
  scope,
  disabled,
}: {
  scope: string
  disabled: boolean
}) {
  const { t } = useTranslation()
  const service = useServiceHub()
  const baseState = useCreation()
  const mediaProfiles = useMediaLibrary((s) => s.profiles)
  const selected =
    baseState.selections[scope]?.[
      baseState.modes[scope] === 'video' ? 'video' : 'image'
    ]
  const profile =
    selected?.provider === 'diffusers'
      ? mediaProfiles.find((p) => p.id === selected.id)
      : undefined
  const state = {
    ...baseState,
    settings: { ...baseState.settings, ...profile?.settings },
    setSettings: (value: Parameters<typeof baseState.setSettings>[0]) => {
      baseState.setSettings(value)
      if (profile)
        useMediaLibrary
          .getState()
          .put({ ...profile, settings: { ...profile.settings, ...value } })
    },
  }
  const providers = useModelProvider((value) => value.providers)
  const mode = state.modes[scope] ?? 'auto'
  const [open, setOpen] = useState(false)
  const settings = state.settings
  const cpp = settings.imageEngine === 'sdcpp'
  const nativeFp4 = settings.imageEngine === 'nvfp4-cuda'
  const separate = cpp || nativeFp4
  const imagePath = separate
    ? (settings.ggufImageModel ?? '')
    : settings.imageModel
  const selection =
    mode === 'image' || mode === 'video'
      ? state.selections[scope]?.[mode]
      : undefined
  const isCloud = selection && selection.provider !== 'diffusers'
  const selectedPreset = selection
    ? mediaPreset(selection.provider, selection.id)
    : undefined
  const progress = state.progress[scope]
  const desktop = isPlatformTauri()
  const numericSettings =
    mode === 'video'
      ? (['width', 'height', 'steps', 'frames', 'fps', 'seed'] as const)
      : (['width', 'height', 'steps', 'seed'] as const)
  useEffect(() => {
    if (
      desktop &&
      !disabled &&
      !isCloud &&
      ((mode === 'image' && !imagePath) ||
        (mode === 'video' && !settings.videoModel))
    )
      setOpen(true)
  }, [
    desktop,
    disabled,
    mode,
    isCloud,
    settings.imageModel,
    imagePath,
    settings.videoModel,
  ])
  useEffect(() => {
    const show = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.installed) {
        const task = event.detail.task === 'video' ? 'video' : 'image'
        state.setSelection(
          scope,
          task,
          event.detail.profileId
            ? { provider: 'diffusers', id: event.detail.profileId }
            : undefined
        )
        state.setMode(scope, task)
      }
      setOpen(true)
    }
    window.addEventListener('novera-creation-settings', show)
    return () => window.removeEventListener('novera-creation-settings', show)
  }, [scope, state.setSelection, state.setMode])
  async function pick(
    kind:
      | 'imageModel'
      | 'videoModel'
      | 'python'
      | 'cppExecutable'
      | 'ggufImageModel'
      | 'ggufTextEncoder'
      | 'ggufVae'
  ) {
    const directory = kind === 'imageModel' || kind === 'videoModel'
    const extensions =
      kind === 'cppExecutable' || kind === 'python'
        ? IS_WINDOWS
          ? ['exe']
          : undefined
        : nativeFp4 && kind === 'ggufImageModel'
          ? ['safetensors']
          : nativeFp4 && kind === 'ggufTextEncoder'
            ? ['gguf']
            : nativeFp4 && kind === 'ggufVae'
              ? ['safetensors']
              : ['gguf', 'safetensors']
    const selected = await service.dialog().open({
      directory,
      multiple: false,
      ...(!directory && extensions
        ? {
            filters: [
              {
                name: kind === 'python' ? 'Python' : t(`chat:creation.${kind}`),
                extensions,
              },
            ],
          }
        : {}),
    })
    if (typeof selected === 'string') state.setSettings({ [kind]: selected })
  }
  return (
    <div className="mx-3 mb-1 mt-2 rounded-xl border bg-secondary/20 p-2 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <div
          className="inline-flex flex-wrap gap-1"
          role="group"
          aria-label={t('chat:creation.output')}
        >
          {(['auto', 'text', 'image', 'video'] as OutputMode[]).map((item) => (
            <Button
              key={item}
              size="sm"
              variant={mode === item ? 'secondary' : 'ghost'}
              disabled={
                disabled || (!desktop && (item === 'image' || item === 'video'))
              }
              aria-pressed={mode === item}
              onClick={() => {
                state.setMode(scope, item)
                if (item === 'text' || item === 'video') state.setSource(scope)
                if (
                  (item === 'image' &&
                    !imagePath &&
                    !state.selections[scope]?.image) ||
                  (item === 'video' &&
                    !settings.videoModel &&
                    !state.selections[scope]?.video)
                )
                  setOpen(true)
              }}
            >
              {item === 'image' ? (
                <IconPhoto size={14} />
              ) : item === 'video' ? (
                <IconVideo size={14} />
              ) : null}
              {t(`chat:creation.${item}`)}
            </Button>
          ))}
        </div>
        <Button
          className="ml-auto"
          size="icon-sm"
          variant="ghost"
          disabled={disabled}
          aria-label={t('chat:creation.settings')}
          onClick={() => setOpen(true)}
        >
          <IconAdjustments size={16} />
        </Button>
      </div>
      {(mode === 'image' || mode === 'video') && (
        <p className="text-xs text-muted-foreground truncate">
          {t('chat:creation.model')}:{' '}
          {isCloud
            ? `${getProviderTitle(selection.provider)} · ${selectedPreset?.name ?? selection.id}`
            : (mode === 'image' ? imagePath : settings.videoModel)
                .split(/[\\/]/)
                .pop() || t('chat:creation.configure')}
        </p>
      )}
      {isCloud && (
        <p className="text-xs text-muted-foreground">
          {t('chat:creation.cloudNote')}
        </p>
      )}
      {state.sources[scope] && (
        <div className="flex items-center gap-2 text-xs">
          <span>{t('chat:creation.source')}</span>
          <button
            className="underline"
            disabled={disabled}
            onClick={() => state.setSource(scope)}
          >
            {t('chat:creation.clearSource')}
          </button>
        </div>
      )}
      {progress && (
        <div role="status" className="space-y-1 text-xs">
          <span>
            {t(
              `chat:creation.${progress.stage === 'loading' ? 'loading' : 'generating'}`
            )}{' '}
            {progress.progress >= 0 ? ` · ${progress.progress}%` : ''}
          </span>
          <progress
            className="h-1.5 w-full"
            value={progress.progress >= 0 ? progress.progress : undefined}
            max={100}
          />
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t('chat:creation.settings')}</DialogTitle>
            <DialogDescription>
              {t('chat:creation.localNote')}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {(['image', 'video'] as const).map((task) => (
              <label key={task} className="block space-y-1 text-sm">
                {t(`chat:creation.${task}`)}
                <select
                  className="block w-full rounded border bg-background p-2 text-xs"
                  value={
                    state.selections[scope]?.[task]
                      ? JSON.stringify(state.selections[scope][task])
                      : ''
                  }
                  onChange={(event) => {
                    const profile = mediaProfiles.find(
                      (p) =>
                        p.id ===
                        (event.target.value
                          ? JSON.parse(event.target.value).id
                          : '')
                    )
                    if (profile) selectMediaProfile(profile, scope)
                    state.setSelection(
                      scope,
                      task,
                      event.target.value
                        ? JSON.parse(event.target.value)
                        : undefined
                    )
                  }}
                >
                  <option value="">
                    {task === 'image' && cpp
                      ? 'stable-diffusion.cpp'
                      : 'Diffusers'}{' '}
                    · {t('chat:creation.local')}
                  </option>
                  {mediaProfiles
                    .filter((p) => p.task === task)
                    .map((p) => (
                      <option
                        key={p.id}
                        value={JSON.stringify({
                          provider: 'diffusers',
                          id: p.id,
                        })}
                      >
                        {t('chat:creation.local')} · {p.name}
                      </option>
                    ))}
                  {providers
                    .filter((provider) => provider.active)
                    .flatMap((provider) =>
                      provider.models
                        .filter(
                          (model) =>
                            model.media_adapter &&
                            modelModalities(model).outputs.includes(task)
                        )
                        .map((model) => (
                          <option
                            key={`${provider.provider}:${model.id}`}
                            value={JSON.stringify({
                              provider: provider.provider,
                              id: model.id,
                            })}
                          >
                            {getProviderTitle(provider.provider)} ·{' '}
                            {model.displayName ?? model.id}
                            {model.preview
                              ? ` · ${t('chat:creation.preview')}`
                              : ''}
                          </option>
                        ))
                    )}
                </select>
              </label>
            ))}
            <p className="text-xs text-muted-foreground">
              {t('chat:creation.cloudNote')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('chat:creation.cloudDefaults')}
            </p>
            <details open={!isCloud}>
              <summary className="cursor-pointer text-sm">
                {t('chat:creation.local')}
              </summary>
              <div className="space-y-3 pt-3">
                <label className="block space-y-1 text-sm">
                  {t('chat:creation.imageEngine')}
                  <select
                    aria-label={t('chat:creation.imageEngine')}
                    className="block w-full rounded border bg-background p-2"
                    value={settings.imageEngine ?? 'diffusers'}
                    onChange={(event) =>
                      state.setSettings({
                        imageEngine: event.target.value as
                          | 'diffusers'
                          | 'sdcpp'
                          | 'nvfp4-cuda',
                        ...(event.target.value !== 'diffusers'
                          ? { steps: 4, ggufGuidance: 1 }
                          : {}),
                      })
                    }
                  >
                    <option value="diffusers">Diffusers</option>
                    <option value="sdcpp">
                      stable-diffusion.cpp · GGUF / Safetensors
                    </option>
                    <option value="nvfp4-cuda">NVFP4 CUDA · PyTorch</option>
                  </select>
                </label>
                {separate && (
                  <>
                    {(cpp || nativeFp4) && (
                      <aside className="space-y-2 rounded-lg border p-3 text-xs">
                        <p className="font-medium">
                          {t('chat:creation.recommendedSetup')}
                        </p>
                        <p className="text-muted-foreground">
                          {t('chat:creationInstall.note')}
                        </p>
                        <p className="text-muted-foreground">
                          {t('hub:catalog.quantQualityAdvice')}
                        </p>
                        {klein4bRecommendation.map((item) => (
                          <a
                            key={item.role}
                            className="block break-words underline"
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {item.name}
                          </a>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            state.setSettings({
                              encoderDevice: 'cpu',
                              device: 'auto',
                              steps: 4,
                              ggufGuidance: 1,
                            })
                          }
                        >
                          {t('chat:creation.applyRecommendedPlacement')}
                        </Button>
                        <CreationInstallButton
                          onStarted={() => setOpen(false)}
                        />
                      </aside>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t(
                        nativeFp4
                          ? 'chat:creation.nativeNote'
                          : 'chat:creation.ggufNote'
                      )}
                    </p>
                    {(
                      [
                        'cppExecutable',
                        'ggufImageModel',
                        'ggufTextEncoder',
                        'ggufVae',
                      ] as const
                    )
                      .filter((key) => !nativeFp4 || key !== 'cppExecutable')
                      .map((key) => (
                        <label
                          key={key}
                          className="block space-y-1 text-sm"
                          htmlFor={`creation-${key}`}
                        >
                          {t(`chat:creation.${key}`)}
                          <div className="flex gap-2">
                            <input
                              id={`creation-${key}`}
                              className="min-w-0 flex-1 rounded border bg-background p-2 text-xs"
                              value={settings[key] ?? ''}
                              placeholder={
                                key === 'cppExecutable'
                                  ? t('chat:creationInstall.engine')
                                  : undefined
                              }
                              onChange={(event) =>
                                state.setSettings({ [key]: event.target.value })
                              }
                            />
                            <Button
                              variant="outline"
                              onClick={() => void pick(key)}
                            >
                              {t('common:browse')}
                            </Button>
                          </div>
                          {key === 'cppExecutable' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                state.setSettings({ cppExecutable: '' })
                              }
                            >
                              {t('chat:creationInstall.engine')}
                            </Button>
                          )}
                        </label>
                      ))}
                    {cpp && (
                      <label className="block text-sm">
                        {t('chat:creation.ggufGuidance')}
                        <input
                          aria-label={t('chat:creation.ggufGuidance')}
                          type="number"
                          min={0}
                          max={30}
                          step={0.5}
                          value={settings.ggufGuidance ?? 1}
                          onChange={(event) =>
                            state.setSettings({
                              ggufGuidance: Number(event.target.value),
                            })
                          }
                          className="block w-full rounded border bg-background p-2"
                        />
                      </label>
                    )}
                  </>
                )}
                {(
                  (separate
                    ? ['videoModel', 'python']
                    : ['imageModel', 'videoModel', 'python']) as (
                    | 'imageModel'
                    | 'videoModel'
                    | 'python'
                  )[]
                ).map((key) => (
                  <div key={key}>
                    <label className="text-sm" htmlFor={`creation-${key}`}>
                      {key === 'python'
                        ? 'Python 3.15.1'
                        : t(`chat:creation.${key}`)}
                    </label>
                    <div className="flex gap-2">
                      <input
                        id={`creation-${key}`}
                        className="min-w-0 flex-1 rounded border bg-background p-2 text-xs"
                        value={settings[key]}
                        onChange={(event) =>
                          state.setSettings({ [key]: event.target.value })
                        }
                      />
                      <Button variant="outline" onClick={() => void pick(key)}>
                        {t('common:browse')}
                      </Button>
                    </div>
                  </div>
                ))}
                <label className="flex items-center justify-between text-sm">
                  {t('chat:creation.generationDevice')}
                  <select
                    className="rounded border bg-background p-2"
                    aria-label={t('chat:creation.generationDevice')}
                    value={settings.device}
                    onChange={(event) =>
                      state.setSettings({
                        device: event.target.value as 'auto' | 'cpu' | 'cuda',
                      })
                    }
                  >
                    <option value="auto">{t('chat:creation.auto')}</option>
                    <option value="cpu">CPU</option>
                    <option value="cuda">CUDA</option>
                  </select>
                </label>
                {separate && mode !== 'video' && (
                  <>
                    <label className="flex items-center justify-between text-sm">
                      {t('chat:creation.encoderDevice')}
                      <select
                        aria-label={t('chat:creation.encoderDevice')}
                        className="rounded border bg-background p-2"
                        value={settings.encoderDevice ?? 'auto'}
                        onChange={(event) =>
                          state.setSettings({
                            encoderDevice: event.target.value as
                              | 'auto'
                              | 'cpu'
                              | 'cuda',
                          })
                        }
                      >
                        <option value="auto">{t('chat:creation.auto')}</option>
                        <option value="cpu">CPU</option>
                        <option value="cuda">CUDA</option>
                      </select>
                    </label>
                    <p className="text-xs text-muted-foreground">
                      {t('chat:creation.deviceNote')}
                    </p>
                  </>
                )}
                <div className="grid grid-cols-2 gap-3">
                  {numericSettings.map((key) => (
                    <label key={key} className="space-y-1 text-xs">
                      {t(`chat:creation.${key}`)}
                      <input
                        className="block w-full rounded border bg-background p-2"
                        type="number"
                        min={
                          key === 'seed'
                            ? 0
                            : key === 'width' || key === 'height'
                              ? 64
                              : 1
                        }
                        max={
                          key === 'seed'
                            ? 4294967295
                            : key === 'steps'
                              ? 100
                              : key === 'frames'
                                ? 257
                                : key === 'fps'
                                  ? 60
                                  : 2048
                        }
                        step={key === 'width' || key === 'height' ? 16 : 1}
                        value={settings[key]}
                        onChange={(event) =>
                          state.setSettings({
                            [key]: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            </details>
            <p className="text-xs text-muted-foreground">
              {t('chat:creation.autosave')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('chat:creation.autoNote')}
            </p>
            <Button className="w-full" onClick={() => setOpen(false)}>
              {t('common:close')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
