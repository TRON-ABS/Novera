import { useState } from 'react'
import { ComposerStatusSwitch } from '@/components/ComposerStatusSwitch'
import { invoke } from '@tauri-apps/api/core'
import { Music2, Clock3, ChevronDown, Dices } from 'lucide-react'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import {
  musicFormats,
  musicDurationFromPrompt,
  musicDurationLimits,
  normalizeMusicSettings,
  type MusicModels,
} from '@/modules/engines/music'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { GenerationCountControl } from './GenerationCountControl'
import { useServiceHub } from '@/hooks/useServiceHub'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { CreationInstallButton } from './CreationInstall'
import { useCreation } from '@/hooks/useCreation'
import { useModelProvider } from '@/hooks/useModelProvider'
import { mediaModelPresets, mediaPreset } from '@/constants/mediaProviders'
import { predefinedProviders } from '@/constants/providers'
import { getProviderLogo, getProviderTitle } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

export function MusicProviderPicker({
  scope,
  disabled,
}: {
  scope: string
  disabled: boolean
}) {
  const { t } = useTranslation()
  const selection = useCreation((s) => s.selections[scope]?.music)
  const preset = selection && mediaPreset(selection.provider, selection.id)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          aria-label={`${t('chat:creation.music')} · ${t('chat:creation.model')}`}
        >
          {selection && (
            <img
              src={getProviderLogo(selection.provider)}
              alt={getProviderTitle(selection.provider)}
              className="size-5 rounded bg-white object-contain p-0.5"
            />
          )}
          {preset
            ? `${getProviderTitle(preset.provider)} · ${preset.name}`
            : `ACE-Step 1.5 · ${t('chat:creation.local')}`}
          <ChevronDown size={14} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem
          onSelect={() => useCreation.getState().setSelection(scope, 'music')}
        >
          <Music2 size={16} />
          ACE-Step 1.5 · {t('chat:creation.local')}
        </DropdownMenuItem>
        {mediaModelPresets
          .filter((p) => p.task === 'music' && p.provider !== 'minimax')
          .map((p) => (
            <DropdownMenuItem
              key={p.provider + p.id}
              onSelect={() => {
                const providers = useModelProvider.getState()
                if (
                  !providers.providers.some(
                    (provider) => provider.provider === p.provider
                  )
                ) {
                  const definition = predefinedProviders.find(
                    (provider) => provider.provider === p.provider
                  )
                  if (definition)
                    providers.addProvider(definition as ModelProvider)
                }
                useCreation
                  .getState()
                  .setSelection(scope, 'music', {
                    provider: p.provider,
                    id: p.id,
                  })
              }}
            >
              <img
                src={getProviderLogo(p.provider)}
                alt={getProviderTitle(p.provider)}
                className="size-5 rounded bg-white object-contain p-0.5"
              />
              {getProviderTitle(p.provider)} · {p.name}
            </DropdownMenuItem>
          ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function useMusic(scope: string) {
  const state = useMusicCreation()
  const profile = state.profiles.find((p) => p.id === state.selections[scope])
  return {
    state,
    profile,
    settings: normalizeMusicSettings(profile?.settings ?? state.settings),
    setSettings: (value: Parameters<typeof state.setSettings>[0]) =>
      state.setSettings(value, scope),
  }
}

export function MusicDashboardControls({
  scope,
  disabled,
  prompt = '',
}: {
  scope: string
  disabled: boolean
  prompt?: string
}) {
  const { t } = useTranslation()
  const { settings, setSettings } = useMusic(scope)
  const cloud = useCreation((s) => s.selections[scope]?.music)
  const { min: minimum, max: maximum } = musicDurationLimits(cloud?.provider)
  const [durationDraft, setDurationDraft] = useState<string>()
  const fixedFormat = cloud
    ? cloud.provider === 'fal'
      ? 'WAV'
      : cloud.provider === 'elevenlabs'
        ? 'MP3 · 192 kb/s'
        : cloud.provider === 'replicate'
          ? 'MP3'
          : settings.quality.startsWith('mp3')
            ? 'MP3'
            : 'WAV'
    : undefined
  const autoDuration = settings.durationAuto !== false
  const requestedDuration = autoDuration ? musicDurationFromPrompt(prompt) : undefined
  return (
    <div className="composer-size-controls ml-auto flex flex-wrap gap-1">
      <Button className="composer-setting" variant="ghost" size="xs"
        role="switch" aria-label={t('chat:creation.musicInstrumental')}
        aria-checked={cloud && !['elevenlabs', 'fal'].includes(cloud.provider) ? true : settings.instrumental}
        disabled={disabled || (Boolean(cloud) && !['elevenlabs', 'fal'].includes(cloud!.provider))}
        onClick={() => setSettings({ instrumental: !settings.instrumental })}>
        <Music2 size={14} aria-hidden="true" />
        {t('chat:creation.musicInstrumental')}
        <ComposerStatusSwitch active={cloud && !['elevenlabs', 'fal'].includes(cloud.provider) ? true : settings.instrumental} />
      </Button>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="composer-setting"
            variant="ghost"
            size="xs"
            disabled={disabled}
            aria-label={t('chat:creation.musicDuration')}
          >
            <Clock3 size={14} />
            {autoDuration && <span>{t('chat:creation.auto')} · </span>}
            {t('common:duration.seconds', {
              count: requestedDuration ?? settings.durationSeconds,
            })}
            <ChevronDown size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3">
          <label className="flex items-center justify-between gap-3 text-sm">
            {t('chat:creation.auto')}
            <Switch aria-label={`${t('chat:creation.musicDuration')} · ${t('chat:creation.auto')}`}
              checked={autoDuration} disabled={disabled}
              onCheckedChange={(durationAuto) => { setDurationDraft(undefined); setSettings({ durationAuto }) }} />
          </label>
          <label className="block text-sm">
            {t('chat:creation.musicDuration')} · {minimum}–{maximum} s
            <input
              aria-label={t('chat:creation.musicDuration')}
              className="mt-1 w-full rounded border bg-background p-2"
              type="number"
              min={minimum}
              max={maximum}
              step={1}
              inputMode="numeric"
              value={durationDraft ?? requestedDuration ?? settings.durationSeconds}
              disabled={disabled}
              aria-invalid={!Number.isInteger(requestedDuration ?? settings.durationSeconds) ||
                (requestedDuration ?? settings.durationSeconds) < minimum || (requestedDuration ?? settings.durationSeconds) > maximum}
              onBlur={() => setDurationDraft(undefined)}
              onChange={(e) => {
                setDurationDraft(e.target.value)
                const n = Number(e.target.value)
                if (Number.isFinite(n)) setSettings({ durationSeconds: n, durationAuto: false })
              }}
            />
          </label>
          <div className="flex flex-wrap gap-1">
            {[10, 30, 60, 90, 120, 150, 180, 210, 240, 360, 480, 600]
              .filter((seconds) => seconds >= minimum && seconds <= maximum)
              .map((seconds) => (
                <Button
                  key={seconds}
                  size="xs"
                  variant="outline"
                  disabled={disabled}
                  onClick={() => { setDurationDraft(undefined); setSettings({ durationSeconds: seconds, durationAuto: false }) }}
                >
                  {t('common:duration.seconds', { count: seconds })}
                </Button>
              ))}
          </div>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="composer-setting"
            variant="ghost"
            size="xs"
            disabled={
              disabled || (Boolean(cloud) && cloud?.provider !== 'stability')
            }
            aria-label={t('chat:creation.musicQuality')}
          >
            {fixedFormat ??
              (settings.quality.startsWith('mp3')
                ? `MP3 · ${settings.quality.slice(4)} kb/s`
                : `WAV · ${settings.quality.slice(3)} bit`)}
            <ChevronDown size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72">
          <label className="block text-sm">
            {t('chat:creation.musicQuality')}
            <select
              aria-label={t('chat:creation.musicQuality')}
              className="mt-1 w-full rounded border bg-background p-2"
              value={settings.quality}
              disabled={disabled}
              onChange={(e) =>
                setSettings({
                  quality: e.target.value as typeof settings.quality,
                })
              }
            >
              {Object.entries(
                cloud ? { 'mp3-320': 'MP3', 'wav24': 'WAV' } : musicFormats
              ).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </PopoverContent>
      </Popover>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            className="composer-setting"
            variant="ghost"
            size="xs"
            disabled={disabled || cloud?.provider === 'elevenlabs'}
            aria-label={t('chat:creation.seedMode')}
          >
            <Dices size={14} />
            {t(
              `chat:creation.seed${settings.seedMode[0].toUpperCase()}${settings.seedMode.slice(1)}`
            )}
            <ChevronDown size={12} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 space-y-3">
          <MusicSeedFields scope={scope} disabled={disabled} />
        </PopoverContent>
      </Popover>
      <GenerationCountControl value={settings.generationCount} disabled={disabled}
        onChange={generationCount => setSettings({ generationCount })} />
    </div>
  )
}

function MusicSeedFields({
  scope,
  disabled,
}: {
  scope: string
  disabled: boolean
}) {
  const { t } = useTranslation()
  const { settings, setSettings } = useMusic(scope)
  return (
    <>
      <label className="block text-sm">
        {t('chat:creation.seedMode')}
        <select
          className="mt-1 w-full rounded border bg-background p-2"
          aria-label={t('chat:creation.seedMode')}
          value={settings.seedMode}
          disabled={disabled}
          onChange={(e) =>
            setSettings({
              seedMode: e.target.value as typeof settings.seedMode,
            })
          }
        >
          {(['random', 'fixed', 'increment', 'decrement'] as const).map(
            (mode) => (
              <option key={mode} value={mode}>
                {t(
                  `chat:creation.seed${mode[0].toUpperCase()}${mode.slice(1)}`
                )}
              </option>
            )
          )}
        </select>
      </label>
      <label className="block text-sm">
        {t('chat:creation.seed')}
        <input
          aria-label={t('chat:creation.seed')}
          className="mt-1 w-full rounded border bg-background p-2"
          type="number"
          min={0}
          max={4294967295}
          value={settings.seed}
          disabled={disabled || settings.seedMode === 'random'}
          onChange={(e) => {
            const n = Number(e.target.value)
            if (Number.isSafeInteger(n) && n >= 0 && n <= 4294967295)
              setSettings({ seed: n })
          }}
        />
      </label>
      {settings.lastSeed !== undefined && (
        <Button
          size="sm"
          variant="outline"
          disabled={disabled}
          onClick={() =>
            setSettings({ seed: settings.lastSeed, seedMode: 'fixed' })
          }
        >
          {t('chat:creation.seedReuse')} · {settings.lastSeed}
        </Button>
      )}
    </>
  )
}

function MusicLyricsGuide() {
  const { t } = useTranslation()
  return <div className="space-y-2 rounded-xl border border-border/70 bg-secondary/20 p-3 text-xs text-muted-foreground">
    <p>{t('chat:creation.musicLyricsGuide', { instrumental: t('chat:creation.musicInstrumental') })}</p>
    <code dir="ltr" className="block whitespace-normal text-foreground">[Intro] → [Verse] → [Chorus] → [Bridge] → [Outro]</code>
  </div>
}

export function MusicSetupPanel({
  scope,
  disabled,
}: {
  scope: string
  disabled: boolean
}) {
  const { t } = useTranslation()
  const service = useServiceHub()
  const { state, settings, profile, setSettings } = useMusic(scope)
  const cloud = useCreation((s) => s.selections[scope]?.music)
  const [models, setModels] = useState<MusicModels>({
    generator: [],
    planner: [],
    encoder: [],
    vae: [],
  })
  const [error, setError] = useState('')
  const roles = [
    [
      'generator',
      'musicGenerator',
      'acestep-v15-turbo-Q4_K_M.gguf',
      '2B · Q4_K_M · 1.45 GB',
    ],
    [
      'planner',
      'musicPlanner',
      'acestep-5Hz-lm-1.7B-Q8_0.gguf',
      '1.7B · Q8_0 · 1.98 GB',
    ],
    [
      'encoder',
      'text',
      'Qwen3-Embedding-0.6B-Q8_0.gguf',
      '0.6B · Q8_0 · 784 MB',
    ],
    ['vae', 'music', 'vae-BF16.gguf', 'VAE · BF16 · 337 MB'],
  ] as const
  async function browse(engine = false) {
    const directory = await service
      .dialog()
      .open({ directory: true, multiple: false })
    if (typeof directory !== 'string') return
    if (engine) {
      setSettings({ engineDirectory: directory })
      return
    }
    try {
      const found = await invoke<MusicModels>('creation_music_models', {
        directory,
      })
      if (roles.some(([role]) => !found[role]?.length))
        throw new Error(t('chat:creation.configure'))
      setModels(found)
      setSettings({
        directory,
        ...Object.fromEntries(
          roles.map(([role]) => [
            role,
            role !== 'encoder' && found[role].includes(settings[role])
              ? settings[role]
              : found[role][0],
          ])
        ),
      })
      setError('')
    } catch (e) {
      setError(String(e))
    }
  }
  if (cloud)
    return (
      <div className="space-y-4">
        <MusicProviderPicker scope={scope} disabled={disabled} />
        {['elevenlabs', 'fal'].includes(cloud.provider) && <MusicLyricsGuide />}
        <p className="text-sm text-muted-foreground">
          {t('chat:creation.cloudNote')}
        </p>
        <MusicDashboardControls scope={scope} disabled={disabled} />
        <label className="flex gap-2">
          <input
            type="checkbox"
            checked={['elevenlabs','fal'].includes(cloud.provider) ? settings.instrumental : true}
            disabled={disabled || !['elevenlabs','fal'].includes(cloud.provider)}
            onChange={(event) =>
              setSettings({ instrumental: event.target.checked })
            }
          />
          {t('chat:creation.musicInstrumental')}
        </label>
        {!settings.instrumental && ['elevenlabs','fal'].includes(cloud.provider) && (
          <label className="block">
            {t('chat:creation.musicLyrics')}
            <textarea
              aria-label={t('chat:creation.musicLyrics')}
              className="block w-full rounded border bg-background p-2"
              disabled={disabled}
              value={settings.lyrics}
              onChange={(event) => setSettings({ lyrics: event.target.value })}
            />
          </label>
        )}
        <a
          className="text-sm underline"
          href={`/settings/providers/${cloud.provider}`}
        >
          {getProviderTitle(cloud.provider)} · {t('common:settings')}
        </a>
      </div>
    )
  return (
    <div className="space-y-4">
      <MusicProviderPicker scope={scope} disabled={disabled} />
      <p className="text-sm text-muted-foreground">
        {t('chat:creation.setupMusicNote')}
      </p>
      <MusicLyricsGuide />
      <aside className="space-y-3 rounded-lg border p-3">
        <h3 className="font-medium">
          ACE-Step 1.5 Turbo 2B · Q4_K_M · 4.54 GB
        </h3>
        <p className="text-xs">
          48 kHz · 2.0 · 10–600 s · 8 {t('chat:creation.steps')}
        </p>
        <div className="grid gap-2 sm:grid-cols-2">
          {roles.map(([role, label, name, detail]) => (
            <div key={role} className="rounded border p-2 text-xs">
              <p className="font-medium">{t(`chat:creation.${label}`)}</p>
              <p className="break-all">{name}</p>
              <p>{detail}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <CreationInstallButton variant="music-gguf" scope={scope} />
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setSettings({
                durationSeconds: 30,
                durationAuto: true,
                steps: 8,
                quality: 'mp3-320',
                device: 'auto',
                bpm: 0,
                instrumental: true,
                seedMode: 'random',
              })
            }
          >
            {t('chat:creation.applyRecommendedPlacement')}
          </Button>
        </div>
        <a
          className="text-xs underline"
          href="https://huggingface.co/Serveurperso/ACE-Step-1.5-GGUF"
          target="_blank"
          rel="noopener noreferrer"
        >
          ACE-Step 1.5 · MIT · GGUF
        </a>
      </aside>
      {!!state.profiles.length && (
        <label className="block text-sm">
          {t('chat:creation.model')}
          <select
            aria-label={`${t('chat:creation.music')} · ${t('chat:creation.model')}`}
            className="mt-1 w-full rounded border bg-background p-2"
            value={profile?.id ?? ''}
            onChange={(e) => state.select(e.target.value, scope)}
          >
            <option value="">{t('common:browse')}</option>
            {state.profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
      )}
      <label className="block text-sm">
        {t('common:selectFolder')} · GGUF
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded border bg-background p-2 text-xs"
            readOnly
            value={settings.directory}
          />
          <Button variant="outline" onClick={() => void browse()}>
            {t('common:browse')}
          </Button>
        </div>
      </label>
      {roles.map(([role, label]) => (
        <label key={role} className="block text-sm">
          {t(`chat:creation.${label}`)}
          <select
            aria-label={`${t('chat:creation.music')} · ${t(`chat:creation.${label}`)}`}
            className="mt-1 w-full rounded border bg-background p-2 text-xs"
            value={settings[role]}
            disabled={!settings.directory || role === 'encoder'}
            onChange={(e) => setSettings({ [role]: e.target.value })}
          >
            {!settings[role] && <option value="">{t('common:browse')}</option>}
            {[...new Set([settings[role], ...models[role]])]
              .filter(Boolean)
              .map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
          </select>
        </label>
      ))}
      <label className="block text-sm">
        {t('chat:creation.local')} · acestep.cpp
        <div className="flex gap-2">
          <input
            className="min-w-0 flex-1 rounded border bg-background p-2 text-xs"
            readOnly
            value={settings.engineDirectory || settings.directory}
          />
          <Button variant="outline" onClick={() => void browse(true)}>
            {t('common:browse')}
          </Button>
        </div>
      </label>
      <MusicDashboardControls scope={scope} disabled={disabled} />
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          BPM · {t('chat:creation.auto')} = 0
          <input
            aria-label="BPM"
            className="mt-1 w-full rounded border bg-background p-2"
            type="number"
            min={0}
            max={300}
            value={settings.bpm}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (Number.isInteger(n) && (n === 0 || (n >= 30 && n <= 300)))
                setSettings({ bpm: n })
            }}
          />
        </label>
        <label className="block text-sm">
          {t('chat:creation.steps')}
          <input
            aria-label={`${t('chat:creation.music')} · ${t('chat:creation.steps')}`}
            className="mt-1 w-full rounded border bg-background p-2"
            type="number"
            min={1}
            max={50}
            value={settings.steps}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (Number.isInteger(n) && n >= 1 && n <= 50)
                setSettings({ steps: n })
            }}
          />
        </label>
        <label className="block text-sm">
          {t('chat:creation.generationDevice')}
          <select
            className="mt-1 w-full rounded border bg-background p-2"
            value={settings.device}
            onChange={(e) =>
              setSettings({ device: e.target.value as typeof settings.device })
            }
          >
            <option value="auto">{t('chat:creation.auto')}</option>
            <option value="cpu">CPU</option>
            <option value="cuda">CUDA</option>
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.instrumental}
            onChange={(e) => setSettings({ instrumental: e.target.checked })}
          />
          {t('chat:creation.musicInstrumental')}
        </label>
      </div>
      {!settings.instrumental && (
        <>
          <label className="block text-sm">
            {t('chat:creation.musicLyrics')}
            <textarea
              aria-label={t('chat:creation.musicLyrics')}
              className="mt-1 min-h-28 w-full rounded border bg-background p-2"
              placeholder={t('chat:creation.auto')}
              value={settings.lyrics}
              maxLength={32000}
              onChange={(e) => setSettings({ lyrics: e.target.value })}
            />
          </label>
          <label className="block text-sm">
            {t('common:language')} · BCP-47
            <input
              aria-label={`${t('chat:creation.music')} · ${t('common:language')}`}
              className="mt-1 w-full rounded border bg-background p-2"
              placeholder={t('chat:creation.auto')}
              value={settings.language}
              maxLength={20}
              onChange={(e) => {
                if (/^[a-zA-Z0-9-]*$/.test(e.target.value))
                  setSettings({ language: e.target.value })
              }}
            />
          </label>
        </>
      )}
      <MusicSeedFields scope={scope} disabled={disabled} />
      <div className="flex gap-2">
        <Button
          variant="outline"
          disabled={!settings.directory}
          onClick={() => {
            const id = profile?.id ?? `music-${crypto.randomUUID()}`
            state.put({
              id,
              name: settings.generator.replace(/\.gguf$/, ''),
              settings: { ...settings },
            })
            state.select(id, scope)
          }}
        >
          {t('common:save')}
        </Button>
        {profile && (
          <Button variant="ghost" onClick={() => state.remove(profile.id)}>
            {t('common:delete')}
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs">
          {t('chat:creation.configure')} · {error}
        </p>
      )}
      <p className="text-xs text-muted-foreground">
        {t('chat:creation.autosave')}
      </p>
    </div>
  )
}

export function MusicModelControl({
  scope,
  disabled,
}: {
  scope: string
  disabled: boolean
}) {
  const { t } = useTranslation()
  const { settings, profile } = useMusic(scope)
  const selection = useCreation((s) => s.selections[scope]?.music)
  const preset = selection && mediaPreset(selection.provider, selection.id)
  const name = preset
    ? `${getProviderTitle(preset.provider)} · ${preset.name}`
    : profile?.name || settings.generator || t('chat:creation.configure')
  return (
    <Button
      className="composer-model min-w-0 max-w-64"
      variant="ghost"
      size="xs"
      disabled={disabled}
      title={name}
      aria-label={`${t('chat:creation.music')} · ${t('chat:creation.model')}: ${name}`}
      onClick={() =>
        window.dispatchEvent(
          new CustomEvent('novera-creation-settings', {
            detail: { task: 'music' },
          })
        )
      }
    >
      {selection ? (
        <img
          src={getProviderLogo(selection.provider)}
          alt={getProviderTitle(selection.provider)}
          className="size-4 rounded bg-white object-contain p-0.5"
        />
      ) : (
        <Music2 size={14} />
      )}
      <span className="truncate" dir="auto">
        {name}
      </span>
      <ChevronDown size={12} />
    </Button>
  )
}
