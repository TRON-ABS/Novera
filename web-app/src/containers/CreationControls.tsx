import { useEffect, useRef, useState } from 'react'
import { IconPhoto, IconVideo, IconCheck, IconChevronDown } from '@tabler/icons-react'
import { useMediaLibrary, selectMediaProfile } from '@/hooks/useMediaLibrary'
import { useCreation, videoSettingsFor } from '@/hooks/useCreation'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useTranslation } from '@/i18n/react-i18next-compat'
import type { OutputMode } from '@/modules/engines/creation'
import { previewOutputMode } from '@/modules/engines/creation'
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
import { cn, getProviderTitle } from '@/lib/utils'
import { mediaPreset } from '@/constants/mediaProviders'
import { modelModalities } from '@/modules/engines/model-modalities'
import { CreationInstallButton } from './CreationInstall'
import { klein4bRecommendation, wan13bRecommendation } from '@/constants/creationRecommendations'
import type { ImageSeedMode } from '@/modules/engines/image-seed'
import { ImageUpscaleControls } from './ImageUpscaleControls'
import { MediaSizeControls } from './MediaSizeControls'
import { useImageUpscale } from '@/hooks/useImageUpscale'
import { Sparkles, FileText, Expand, ShieldCheck, SlidersHorizontal, Music2, Dices } from 'lucide-react'
import { TextSetupPanel } from './TextSetupPanel'
import { EmbeddingSetupPanel } from './EmbeddingSetupPanel'
import { VideoDurationControl } from './VideoDurationControl'
import { MusicSetupPanel, MusicDashboardControls, MusicModelControl } from './MusicControls'
import { useMusicCreation, musicSettingsFor } from '@/hooks/useMusicCreation'
import { ComposerStatusSwitch } from '@/components/ComposerStatusSwitch'
import { useThreads } from '@/hooks/useThreads'
import { ComposerSizeButton } from './ComposerSizeButton'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { GenerationCountControl } from './GenerationCountControl'

export function CreationControls({
  scope,
  disabled,
  panelTask,
  prompt = '',
}: {
  scope: string
  disabled: boolean
  panelTask?: 'image' | 'video'
  prompt?: string
}) {

  const { t } = useTranslation()
  const service = useServiceHub()
  const baseState = useCreation()
  const selectedMode = baseState.modes[scope] ?? 'auto'
  const mode = previewOutputMode(selectedMode, prompt, baseState.resolvedModes[scope], disabled)
  const musicAvailable=useMusicCreation((s)=>{const music=s.profiles.find((p)=>p.id===s.selections[scope])?.settings??s.settings;return !!(music.directory&&music.generator)}) || !!baseState.selections[scope]?.music
  const autoPrompted = useRef<string | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [settingsTask, setSettingsTask] = useState<'image' | 'video'>(mode === 'video' ? 'video' : 'image')
  const task = panelTask ?? (open ? settingsTask : mode === 'video' ? 'video' : 'image')
  const upscale = useImageUpscale()
  const mediaProfiles = useMediaLibrary((s) => s.profiles)
  const selected =
    baseState.selections[scope]?.[
      task
    ]
  const profile =
    selected?.provider === 'diffusers'
      ? mediaProfiles.find((p) => p.id === selected.id)
      : undefined
  const state = {
    ...baseState,
    settings: {
      ...(task === 'video' ? videoSettingsFor(baseState) : baseState.settings),
      ...profile?.settings,
      ...(profile
        ? {
            seedMode: profile.settings.seedMode ?? ('random' as const),
            lastImageSeed: profile.settings.lastImageSeed,
            mediaRatio: profile.settings.mediaRatio,
            generationCount: profile.settings.generationCount ?? 1,
          }
        : {}),
    },
    setSettings: (value: Parameters<typeof baseState.setSettings>[0]) => {
      if (task === 'video') baseState.setVideoSettings(value)
      else baseState.setSettings(value)
      if (profile)
        useMediaLibrary
          .getState()
          .put({ ...profile, settings: { ...profile.settings, ...value } })
    },
  }
  const providers = useModelProvider((value) => value.providers)
  const settings = state.settings
  const cpp = (task === 'image' ? settings.imageEngine : settings.videoEngine) === 'sdcpp'
  const nativeFp4 = task === 'image' && settings.imageEngine === 'nvfp4-cuda'
  const separate = cpp || nativeFp4
  const imagePath = ['sdcpp', 'nvfp4-cuda'].includes(baseState.settings.imageEngine ?? '') ? baseState.settings.ggufImageModel : baseState.settings.imageModel
  const selection = state.selections[scope]?.[task]
  const isCloud = (!panelTask&&mode==='music')?false:selection && selection.provider !== 'diffusers'
  const progress = state.progress[scope]
  const desktop = isPlatformTauri()
  const numericSettings =
    task === 'video'
      ? (['width', 'height', 'steps', 'frames', 'fps', 'seed'] as const)
      : (['width', 'height', 'steps', 'seed'] as const)
  useEffect(() => {
    if (autoPrompted.current === `${scope}:${mode}`) return
    if (
      !panelTask && desktop &&
      !disabled &&
      !isCloud &&
      ((mode === 'image' && !imagePath) ||
        (mode === 'music' && !musicAvailable) ||
        (mode === 'video' && !videoSettingsFor(baseState).videoModel)) && selectedMode !== 'auto'
    ) {
      autoPrompted.current = `${scope}:${mode}`
      setSettingsTask(mode === 'video' ? 'video' : 'image')
      setOpen(true)
    }
  }, [
    desktop,
    disabled,
    mode,
    isCloud,
    baseState.settings.imageModel,
    imagePath,
    baseState.videoSettings?.videoModel,
    baseState.settings.videoModel,
    panelTask,
    scope,
    musicAvailable,
    selectedMode,
  ])
  useEffect(() => {
    if (panelTask) return
    const show = (event: Event) => {
      const requestedTask = event instanceof CustomEvent && event.detail?.task ? event.detail.task : mode === 'video' ? 'video' : 'image'
      setSettingsTask(requestedTask === 'video' ? 'video' : 'image')
      if (event instanceof CustomEvent && event.detail?.installed) {
        if(event.detail.task==='music') {
          useMusicCreation.getState().select(event.detail.profileId,scope)
          if(selectedMode!=='auto')state.setMode(scope,'music')
          setOpen(true)
          return
        }
        const task = event.detail.task === 'video' ? 'video' : 'image'
        state.setSelection(
          scope,
          task,
          event.detail.profileId
            ? { provider: 'diffusers', id: event.detail.profileId }
            : undefined
        )
        if(selectedMode!=='auto')state.setMode(scope, task)
      }
      setOpen(true)
    }
    window.addEventListener('novera-creation-settings', show)
    return () => window.removeEventListener('novera-creation-settings', show)
  }, [scope, state.setSelection, state.setMode, mode, panelTask, selectedMode])
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
    const directory = kind === 'imageModel' || (kind === 'videoModel' && !cpp)
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
  const settingsContent = (
          <div className="space-y-3">
            {([task] as const).map((task) => (
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
                    {cpp
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
                {task === 'video' && <label className="block space-y-1 text-sm">
                  {t('chat:creation.local')} · {t('chat:creation.model')}
                  <select aria-label={`${t('chat:creation.video')} · ${t('chat:creation.model')}`} className="block w-full rounded border bg-background p-2"
                    value={settings.videoEngine ?? 'diffusers'} onChange={(event) => state.setSettings({ videoEngine: event.target.value as 'diffusers' | 'sdcpp' })}>
                    <option value="diffusers">Diffusers</option>
                    <option value="sdcpp">stable-diffusion.cpp · GGUF · Q4_K_M</option>
                    <option value="nvfp4-cuda" disabled>NVFP4 · {t('common:editModel.notAvailable')}</option>
                  </select>
                </label>}
                    {task === 'image' && (
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
                {task === 'image' && <label className="block space-y-1 text-sm">
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
                </label>}
                {task === 'video' && <aside className="space-y-2 rounded-lg border p-3 text-xs">
                  <p className="font-medium">{t('chat:creation.recommendedSetup')} · Wan2.1 T2V 1.3B · Q4_K_M</p>
                  <p>{t('chat:creation.text')} → {t('chat:creation.video')} · {t('common:duration.seconds', { count: 5 })} · 21:9 · {t('chat:creation.preview')}</p>
                  <p className="text-muted-foreground">{t('chat:creation.videoDurationNote')}</p>
                  {wan13bRecommendation.map((item) => <a key={item.role} className="block break-words underline" href={item.url} target="_blank" rel="noopener noreferrer">{item.name}</a>)}
                  <Button variant="outline" size="sm" onClick={() => state.setSettings({ videoEngine: 'sdcpp', encoderDevice: 'cpu', device: 'auto', width: 512, height: 224, mediaRatio: '21:9', frames: 81, fps: 16, durationSeconds: 5, steps: 20, ggufGuidance: 6 })}>{t('chat:creation.applyRecommendedPlacement')}</Button>
                  <CreationInstallButton variant="video-gguf" onStarted={() => setOpen(false)} />
                </aside>}
                {task === 'image' && separate && (
                  <>

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
                      .filter(
                        (key) =>
                          key !== 'cppExecutable' || (!nativeFp4 && !IS_WINDOWS)
                      )
                      .map((key) => (
                        <label
                          key={key}
                          className="block space-y-1 text-sm"
                          htmlFor={`creation-${task}-${key}`}
                        >
                          {t(`chat:creation.${key}`)}
                          <div className="flex gap-2">
                            <input
                              id={`creation-${task}-${key}`}
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
                  (task === 'video' ? (cpp ? [...(!IS_WINDOWS ? ['cppExecutable'] : []), 'videoModel', 'ggufTextEncoder', 'ggufVae','python'] : ['videoModel', 'python'])
                    : separate ? ['python'] : ['imageModel', 'python']) as ('imageModel' | 'videoModel' | 'python' | 'cppExecutable' | 'ggufTextEncoder' | 'ggufVae')[]
                ).map((key) => (
                  <div key={key}>
                    <label className="text-sm" htmlFor={`creation-${task}-${key}`}>
                      {key === 'python'
                        ? task==='video'&&cpp?'Python · imageio-ffmpeg':'Python 3.15.1'
                        : task === 'video' && key === 'videoModel' && cpp ? `${t('chat:creation.video')} · GGUF` : task === 'video' && key === 'ggufTextEncoder' ? 'UMT5-XXL · GGUF' : task === 'video' && key === 'ggufVae' ? 'Wan2.1 VAE' : t(`chat:creation.${key}`)}
                    </label>
                    <div className="flex gap-2">
                      <input
                        id={`creation-${task}-${key}`}
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
                {separate && (
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
                {!isCloud && (
                  <div className="space-y-2 text-xs">
                    <label className="block space-y-1">
                      {t('chat:creation.seedMode')}
                      <select
                        aria-label={t('chat:creation.seedMode')}
                        className="block w-full rounded border bg-background p-2"
                        value={settings.seedMode ?? 'random'}
                        onChange={(event) =>
                          state.setSettings({
                            seedMode: event.target.value as ImageSeedMode,
                          })
                        }
                      >
                        {(
                          ['random', 'fixed', 'increment', 'decrement'] as const
                        ).map((value) => (
                          <option key={value} value={value}>
                            {t(
                              `chat:creation.seed${value[0].toUpperCase()}${value.slice(1)}`
                            )}
                          </option>
                        ))}
                      </select>
                    </label>
                    <p className="text-muted-foreground">
                      {t('chat:creation.seedNote')}
                    </p>
                    {settings.lastImageSeed !== undefined && (
                      <div className="flex flex-wrap items-center gap-2">
                        <span>
                          {t('chat:creation.seedLast')}:{' '}
                          {settings.lastImageSeed}
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            state.setSettings({
                              seedMode: 'fixed',
                              seed: settings.lastImageSeed,
                            })
                          }
                        >
                          {t('chat:creation.seedReuse')}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
                <MediaSizeControls
                  settings={settings}
                  setSettings={state.setSettings}
                />
                <div className="grid grid-cols-2 gap-3">
                  {numericSettings.map((key) => (
                    <label key={key} className="space-y-1 text-xs">
                      {t(`chat:creation.${key}`)}
                      <input
                        className="block w-full rounded border bg-background p-2"
                        type="number"
                        disabled={
                          key === 'seed' &&
                          (settings.seedMode ?? 'random') === 'random'
                        }
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
                            ...(key === 'width' || key === 'height'
                              ? {
                                  mediaRatio: `custom:${key === 'width' ? Number(event.target.value) : settings.width}:${key === 'height' ? Number(event.target.value) : settings.height}`,
                                }
                              : {}),
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
                {task !== 'video' && !isCloud && (
                  <p className="text-xs text-muted-foreground">
                    {t('chat:creation.imageResolutionMax')}
                  </p>
                )}
                {task !== 'video' && !isCloud && <ImageUpscaleControls />}
              </div>
            </details>
            <p className="text-xs text-muted-foreground">
              {t('chat:creation.autosave')}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('chat:creation.autoNote')}
            </p>
          </div>
  )
  if (panelTask) return settingsContent

  return (
    <div className="composer-creation mx-3 mt-2 flex flex-wrap items-center gap-1.5">
      <div className="contents">
        <div
          className="composer-modes inline-flex flex-wrap gap-1"
          role="group"
          aria-label={t('chat:creation.output')}
        >
          {(['auto', 'text', 'image', 'music', 'video'] as OutputMode[]).map((item) => (
            <Button
              key={item}
              size="sm"
              variant="ghost"
              className={cn(
                'composer-mode border border-transparent',
                (mode === item || (item === 'auto' && selectedMode === 'auto')) && 'composer-tool-active'
              )}
              disabled={
                disabled || ((!desktop||IS_ANDROID||IS_IOS) && (item === 'image' || item === 'music' || item === 'video'))
              }
              aria-pressed={mode === item || (item === 'auto' && selectedMode === 'auto')}
              onClick={() => {
                state.setMode(scope, item)
                setSettingsTask(item === 'video' ? 'video' : 'image')
                if (item === 'text' || item === 'video' || item === 'music') state.setSource(scope)
                if (
                  (item === 'image' &&
                    !imagePath &&
                    !state.selections[scope]?.image) ||
                  (item === 'music' && !musicSettingsFor(scope).generator && !state.selections[scope]?.music) ||
                  (item === 'video' &&
                    !videoSettingsFor(baseState).videoModel &&
                    !state.selections[scope]?.video)
                )
                  setOpen(true)
              }}
            >
              <span className="composer-mode-main">
              {item === 'image' ? (
                <IconPhoto size={14} />
              ) : item === 'music' ? <Music2 size={14}/> : item === 'video' ? (
                <IconVideo size={14} />
              ) : item === 'auto' ? <Sparkles size={16} aria-hidden="true" /> : <FileText size={16} aria-hidden="true" />}
              <span className="composer-mode-label">{t(`chat:creation.${item}`)}</span>
              {mode === item || (item === 'auto' && selectedMode === 'auto') ? <IconCheck size={12} aria-hidden="true" /> : <ComposerStatusSwitch active={false} />}
              </span>
              <span className="composer-mode-status" aria-hidden="true">{mode === item || (item === 'auto' && selectedMode === 'auto') ? t('common:activeSuffix').replace(/[()]/g, '').trim().toUpperCase() : t('ui:off')}</span>
            </Button>
          ))}
        </div>
        <Button className="composer-settings ml-auto order-2" size="icon-sm" variant="ghost" disabled={disabled}
          aria-label={t('chat:creation.settings')}
          title={`${t('common:settings')} · ${t('chat:creation.text')} / ${t('chat:creation.image')} / ${t('chat:creation.music')} / ${t('chat:creation.video')} · ${t('chat:creation.auto')} / ${t('common:browse')}`}
          onClick={() => setOpen(true)}><SlidersHorizontal size={16} aria-hidden="true" /></Button>
      </div>
      {mode==='music'&&<MusicDashboardControls scope={scope} disabled={disabled} prompt={prompt}/>}
      {(mode === 'image' || mode === 'video') && !isCloud && (
        <div className="composer-size-controls ml-auto flex flex-wrap gap-1">
          {mode === 'video' && <VideoDurationControl settings={settings} setSettings={state.setSettings} disabled={disabled} prompt={prompt} />}
          <ComposerSizeButton kind="ratio" settings={settings} setSettings={state.setSettings} disabled={disabled} />
          <ComposerSizeButton kind="resolution" settings={settings} setSettings={state.setSettings} disabled={disabled} />
          {mode === 'video' && (
            <Popover>
              <PopoverTrigger asChild>
                <Button className="composer-setting" variant="ghost" size="xs" disabled={disabled}
                  aria-label={`${t('chat:creation.frames')} · ${t('chat:creation.fps')}`}>
                  <IconVideo size={14} aria-hidden="true" />
                  {settings.frames} / {settings.fps} FPS
                  <IconChevronDown size={12} aria-hidden="true" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 space-y-3" align="end">
                {(['frames', 'fps'] as const).map((key) => <label key={key} className="block text-sm">
                  {t(`chat:creation.${key}`)}
                  <input className="mt-1 w-full rounded border bg-background p-2" type="number" min={1} step={1}
                    value={settings[key]} disabled={disabled} onChange={(event) => {
                      const value = Number(event.target.value)
                      if (Number.isSafeInteger(value) && value > 0) state.setSettings({ [key]: value })
                    }} />
                </label>)}
              </PopoverContent>
            </Popover>
          )}
          {mode === 'image' && (
            <div className="composer-upscale-group inline-flex">
            <Button
              size="xs"
              variant="ghost"
              className={cn('composer-setting composer-upscale border border-transparent', upscale.enabled && 'composer-tool-active')}
              disabled={disabled}
              data-state={upscale.enabled ? 'on' : 'off'}
              onClick={() => upscale.setEnabled(!upscale.enabled)}
              aria-pressed={upscale.enabled}
              aria-label={`${t('chat:creation.upscaleTitle')} · ×${upscale.factor}${upscale.enabled ? ` · ${settings.width * upscale.factor} × ${settings.height * upscale.factor}` : ` · ${t('ui:off')}`}`}
              title={upscale.enabled ? `Real-ESRGAN ×${upscale.factor} · ${settings.width * upscale.factor} × ${settings.height * upscale.factor}` : t('ui:realEsrganOff')}
            >
              <Expand aria-hidden="true" size={16} />
              ×{upscale.factor} · {upscale.enabled ? t('ui:on') : t('ui:off')}
              <ComposerStatusSwitch active={upscale.enabled} />
              <span className="composer-final-size" aria-hidden="true">{settings.width * (upscale.enabled ? upscale.factor : 1)} × {settings.height * (upscale.enabled ? upscale.factor : 1)}</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-xs" className="composer-factor" disabled={disabled} aria-label={t('chat:creation.upscaleFactor')}>
                  <IconChevronDown size={12} aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {([2, 4] as const).map((factor) => (
                  <DropdownMenuItem key={factor} onSelect={() => upscale.setFactor(factor)}>
                    ×{factor} · {settings.width * factor} × {settings.height * factor}
                    {upscale.factor === factor && <IconCheck size={12} aria-hidden="true" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button className="composer-setting" variant="ghost" size="xs" disabled={disabled}
                aria-label={t('chat:creation.seedMode')}>
                <Dices size={14} aria-hidden="true" />
                {t('chat:creation.seedMode')} · {t(`chat:creation.seed${(settings.seedMode ?? 'random')[0].toUpperCase()}${(settings.seedMode ?? 'random').slice(1)}`)}
                <IconChevronDown size={12} aria-hidden="true" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 space-y-3" align="end">
              <label className="block text-sm">
                {t('chat:creation.seedMode')}
                <select className="mt-1 w-full rounded border bg-background p-2"
                  aria-label={t('chat:creation.seedMode')} disabled={disabled}
                  value={settings.seedMode ?? 'random'} onChange={(event) => state.setSettings({ seedMode: event.target.value as ImageSeedMode })}>
                  {(['random', 'fixed', 'increment', 'decrement'] as const).map((value) => (
                    <option key={value} value={value}>{t(`chat:creation.seed${value[0].toUpperCase()}${value.slice(1)}`)}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                {t('chat:creation.seed')}
                <input className="mt-1 w-full rounded border bg-background p-2" type="number"
                  aria-label={t('chat:creation.seed')} min={0} max={4294967295} step={1}
                  value={settings.seed} disabled={disabled || (settings.seedMode ?? 'random') === 'random'}
                  onChange={(event) => {
                    const seed = Number(event.target.value)
                    if (event.target.value !== '' && Number.isSafeInteger(seed) && seed >= 0 && seed <= 4294967295)
                      state.setSettings({ seed })
                  }} />
              </label>
              <p className="text-xs text-muted-foreground">{t('chat:creation.seedNote')}</p>
              {settings.lastImageSeed !== undefined && (
                <Button size="sm" variant="outline" disabled={disabled}
                  onClick={() => state.setSettings({ seedMode: 'fixed', seed: settings.lastImageSeed })}>
                  {t('chat:creation.seedReuse')} · {settings.lastImageSeed}
                </Button>
              )}
            </PopoverContent>
          </Popover>
          <GenerationCountControl value={settings.generationCount} disabled={disabled}
            onChange={generationCount => state.setSettings({ generationCount })} />
        </div>
      )}
      {(mode === 'image' || mode === 'video') && isCloud && (
        <GenerationCountControl value={settings.generationCount} disabled={disabled}
          onChange={generationCount => state.setSettings({ generationCount })} />
      )}
      {(isCloud || (mode==='music' && !!baseState.selections[scope]?.music)) && (
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
        <div role="status" className="w-full space-y-1 text-xs">
          <span>
            {t(
              `chat:creation.${progress.stage === 'upscaling' ? 'upscaleTitle' : progress.stage === 'loading' ? 'loading' : progress.stage === 'finalizing' ? 'finalizing' : 'generating'}`
            )}{' '}
            {progress.progress >= 0 ? ` · ${progress.progress}%` : ''}
            {progress.detail ? ` · ${progress.detail}` : ''}
          </span>
          <progress
            className="h-1.5 w-full"
            value={progress.progress >= 0 ? progress.progress : undefined}
            max={100}
          />
        </div>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><ShieldCheck className="size-5 text-cyan-400" />Novera · {t('common:settings')}</DialogTitle>
            <DialogDescription>{t('hub:catalog.advisorNote')}</DialogDescription>
          </DialogHeader>
          <aside className="space-y-3 rounded-xl border border-cyan-400/30 bg-cyan-400/5 p-4">
            <p className="text-sm">{t('chat:creation.setupAllNote')}</p>
            <CreationInstallButton variant="all-recommended" scope={scope} />
          </aside>
          <section className="rounded-xl border p-4 space-y-4" aria-label={t('chat:creation.text')}>
            <h2 className="font-medium">{t('chat:creation.text')}</h2>
            <p className="text-sm text-muted-foreground">{t('chat:creation.setupTextNote')}</p>
            <TextSetupPanel scope={scope} onNavigate={() => setOpen(false)} />
          </section>
          <section className="rounded-xl border p-4 space-y-4" aria-label={t('providers:embeddingModels')}>
            <h2 className="font-medium">{t('providers:embeddingModels')}</h2>
            <EmbeddingSetupPanel />
          </section>
          {(['image', 'music', 'video'] as const).map((kind) => <section key={kind} className="rounded-xl border p-4 space-y-4" aria-label={t(`chat:creation.${kind}`)}>
            <h2 className="font-medium">{t(`chat:creation.${kind}`)}</h2>
            {kind==='music'?<MusicSetupPanel scope={scope} disabled={disabled}/>:<>
              <p className="text-sm text-muted-foreground">{t(`chat:creation.${kind==='image'?'setupImageNote':'setupVideoNote'}`)}</p>
              <CreationControls scope={scope} disabled={disabled} panelTask={kind} /></>}
          </section>)}
          <Button onClick={() => setOpen(false)}>{t('common:close')}</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Compact model selector docked beside the conversation actions. */
export function CreationModelControl({ scope, disabled, prompt = '' }: { scope: string; disabled: boolean; prompt?: string }) {
  const { t } = useTranslation()
  const state = useCreation()
  const profiles = useMediaLibrary((s) => s.profiles)
  const threadModel = useThreads((s) => s.threads[scope]?.model)
  const textModel = useModelProvider((s) => threadModel ? s.providers.find((p) => p.provider === threadModel.provider)?.models.find((m) => m.id === threadModel.id) : s.selectedModel)
  const mode = previewOutputMode(state.modes[scope] ?? 'auto', prompt, state.resolvedModes[scope], disabled)
  if(mode==='music')return <MusicModelControl scope={scope} disabled={disabled}/>
  if (mode === 'text') {
    const name = textModel?.name || textModel?.id || threadModel?.id || t('chat:creation.configure')
    return <Button size="xs" variant="ghost" className="composer-model min-w-0 max-w-64" disabled={disabled}
      aria-label={`${t('chat:creation.text')} · ${t('chat:creation.model')}: ${name}`} title={`${t('chat:creation.text')} · ${name}`}
      onClick={() => window.dispatchEvent(new CustomEvent('novera-creation-settings', { detail: { task: 'text' } }))}>
      <FileText size={14} aria-hidden="true"/><span className="truncate" dir="auto">{name}</span><IconChevronDown size={12} aria-hidden="true"/>
    </Button>
  }
  const selection = state.selections[scope]?.[mode]
  const isCloud = selection && selection.provider !== 'diffusers'
  const settings = mode === 'video' ? videoSettingsFor(state) : state.settings
  const modelPath = mode === 'video'
    ? settings.videoModel
    : settings.imageEngine === 'sdcpp' || settings.imageEngine === 'nvfp4-cuda'
      ? settings.ggufImageModel
      : settings.imageModel
  const profile = selection?.provider === 'diffusers'
    ? profiles.find((p) => p.id === selection.id)
    : undefined
  const name = isCloud
    ? `${getProviderTitle(selection.provider)} · ${mediaPreset(selection.provider, selection.id)?.name ?? selection.id}`
    : profile?.name || modelPath?.split(/[\\/]/).pop() || t('chat:creation.configure')
  return (
    <Button
      size="xs"
      variant="ghost"
      className="composer-model min-w-0 max-w-64"
      disabled={disabled}
      aria-label={`${t('chat:creation.model')}: ${name}`}
      title={`${t(`chat:creation.${mode}`)} · ${name}`}
      onClick={() => window.dispatchEvent(new CustomEvent('novera-creation-settings', { detail: { task: mode } }))}
    >
      {mode === 'video' ? <IconVideo size={14} aria-hidden="true" /> : <IconPhoto size={14} aria-hidden="true" />}
      <span className="truncate" dir="auto">{name.replace(/^flux[-_.]?2[-_.]?klein[-_.]?4b.*$/i, 'FLUX.2 Klein 4B')}</span>
      <IconChevronDown size={12} aria-hidden="true" />
    </Button>
  )
}
