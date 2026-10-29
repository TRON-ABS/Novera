import { useState, useEffect } from 'react'
import { invoke } from '@tauri-apps/api/core'
import { IconDownload, IconCircleCheck } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useServiceHub } from '@/hooks/useServiceHub'
import {
  useCreationInstall,
  installAction,
  applyInstalled,
  type InstallPlan,
} from '@/hooks/useCreationInstall'
import { useCreation, videoSettingsFor } from '@/hooks/useCreation'
import { formatBytes } from '@/lib/utils'

export function CreationInstallButton({
  onStarted,
  variant = 'gguf',
  scope,
}: { onStarted?: () => void; variant?: 'gguf' | 'upscale' | 'video-gguf' | 'music-gguf' | 'all-recommended'; scope?: string } = {}) {
  const { t } = useTranslation()
  const service = useServiceHub()
  const { parent, setParent, job } = useCreationInstall()
  const python = useCreation((s) => variant === 'video-gguf'||variant==='all-recommended' ? videoSettingsFor(s).python : s.settings.python)
  const [fp4, setFp4] = useState(false)
  const upscale = variant === 'upscale'
  const video = variant === 'video-gguf'
  const music = variant === 'music-gguf'
  const all = variant === 'all-recommended'
  useEffect(() => {
    let active = true
    setFp4(false)
    if (upscale || video || music || all) return
    void invoke<{ eligible: boolean }>('creation_bundle_nvfp4_probe', {
      python,
    })
      .then((result) => {
        if (active) setFp4(result?.eligible === true)
      })
      .catch(() => {})
    return () => {
      active = false
    }
  }, [python, upscale, video, music, all])
  const [plan, setPlan] = useState<InstallPlan>()
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  async function prepare(folder = parent, selectedVariant: string = variant) {
    setBusy(true)
    setError(false)
    try {
      setPlan(
        await invoke<InstallPlan>('creation_bundle_plan', {
          parent: folder || null,
          variant: selectedVariant,
          python,
        })
      )
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        disabled={busy || ((music||all)&&!IS_WINDOWS) || (job && !['ready', 'cancelled'].includes(job.phase))}
        title={(music||all)&&!IS_WINDOWS?`${t('common:editModel.notAvailable')} · Windows`:undefined}
        onClick={() => void prepare()}
      >
        <IconDownload size={14} />
        {t(all ? 'chat:creation.setupAllDownload' : upscale ? 'chat:creation.upscaleInstall' : 'chat:creationInstall.install')}
      </Button>
      {!upscale && !video && !music && !all && <Button
        variant="outline"
        size="sm"
        disabled={
          !fp4 || busy || (job && !['ready', 'cancelled'].includes(job.phase))
        }
        onClick={() => void prepare(parent, 'nvfp4')}
      >
        NVFP4 CUDA · FLUX.2 Klein 4B
      </Button>}

      {!upscale && !video && !music && !all && <p className="text-xs text-muted-foreground">
        {t(fp4 ? 'hub:catalog.nvfp4Prefer' : 'chat:creation.nativeNote')}
      </p>}
      {job?.phase === 'ready' && (all ? job.plan.variant==='all-recommended' : music ? job.plan.variant==='music-gguf' : video ? job.plan.variant === 'video-gguf' : upscale ? job.plan.variant === 'upscale' : !['upscale', 'video-gguf','music-gguf','all-recommended'].includes(job.plan.variant ?? 'gguf')) && (
        <Button variant="outline" size="sm" onClick={() => {void applyInstalled(job,scope).catch(()=>setError(true))}}>
          {t('chat:creationInstall.use')}
        </Button>
      )}
      {error && <p role="alert">{t('chat:creationInstall.error')}</p>}
      <Dialog
        open={!!plan}
        onOpenChange={(open) => {
          if (!busy && !open) setPlan(undefined)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t(all ? 'chat:creation.setupAllDownload' : upscale ? 'chat:creation.upscaleInstall' : 'chat:creationInstall.install')}</DialogTitle>
            <DialogDescription>
              {t('chat:creationInstall.confirm')}
            </DialogDescription>
          </DialogHeader>
          {plan && (
            <>
              <p className="text-sm">{t('chat:creationInstall.background')}</p>
              <p className="text-xs text-muted-foreground">
                {all ? t('chat:creation.setupAllNote') : music ? t('chat:creation.setupMusicNote') : video ? `${t('chat:creation.text')} → ${t('chat:creation.video')} · Wan2.1 1.3B Q4_K_M · UMT5-XXL CPU · ${t('chat:creation.preview')}` : t(
                  upscale ? 'chat:creation.upscaleNote' : plan.variant === 'nvfp4'
                    ? 'chat:creation.nativeNote'
                    : 'chat:creationInstall.note'
                )}
              </p>
              <label className="text-sm">
                {t('common:selectFolder')}
                <input
                  className="mt-1 w-full rounded border p-2 text-xs"
                  readOnly
                  value={plan.directory}
                />
              </label>
              <Button
                variant="outline"
                disabled={busy}
                onClick={async () => {
                  const folder = await service
                    .dialog()
                    .open({ directory: true, multiple: false })
                  if (typeof folder === 'string') {
                    setParent(folder)
                    await prepare(folder, plan.variant || 'gguf')
                  }
                }}
              >
                {t('common:browse')}
              </Button>
              <ul className="space-y-2 text-xs">
                {plan.files.map((file) => (
                  <li key={file.role} className="break-words">
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      {file.name}
                    </a>{' '}
                    · {formatBytes(file.size)}
                  </li>
                ))}
              </ul>
              {music || all ? <a className="text-xs underline" href="https://huggingface.co/Serveurperso/ACE-Step-1.5-GGUF" target="_blank" rel="noopener noreferrer">ACE-Step 1.5 · MIT</a> : upscale ? (
                <a className="text-xs underline" href="https://github.com/xinntao/Real-ESRGAN/blob/master/docs/model_zoo.md"
                  target="_blank" rel="noopener noreferrer">Real-ESRGAN</a>
              ) : video ? <a className="text-xs underline" href="https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B" target="_blank" rel="noopener noreferrer">Wan2.1 · Apache-2.0</a> : <div className="text-xs underline flex gap-3">
                <a
                  href={
                    plan.variant === 'nvfp4'
                      ? 'https://huggingface.co/black-forest-labs/FLUX.2-klein-4b-nvfp4'
                      : 'https://huggingface.co/unsloth/FLUX.2-klein-4B-GGUF'
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FLUX.2 Klein
                </a>
                <a
                  href="https://huggingface.co/Qwen/Qwen3-4B-GGUF"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Qwen3
                </a>
                <a
                  href="https://huggingface.co/black-forest-labs/FLUX.2-klein-4B"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  FLUX.2 VAE
                </a>
              </div>}
              <p className="text-sm" role="status">
                {t('chat:creationInstall.space', {
                  total: formatBytes(plan.total),
                  free: formatBytes(plan.available),
                })}
              </p>
              <p className="text-xs">{t('chat:creation.setupStorage',{download:formatBytes(plan.total),reserve:formatBytes(256*1024*1024),required:formatBytes(plan.requiredSpace??plan.total+256*1024*1024),free:formatBytes(plan.available)})}</p>
              {plan.available<(plan.requiredSpace??plan.total+256*1024*1024)&&<p role="alert" className="text-sm text-destructive">{t('chat:creation.setupSpaceMissing',{missing:formatBytes((plan.requiredSpace??plan.total+256*1024*1024)-plan.available)})}</p>}
              {plan.videoRuntimeReady===false&&<div role="alert" className="space-y-2 text-sm text-destructive"><p>{t('common:editModel.notAvailable')} · {t('chat:creation.video')} · Python + imageio-ffmpeg</p>
                <Button variant="outline" onClick={()=>{setPlan(undefined);window.dispatchEvent(new CustomEvent('novera-creation-settings',{detail:{task:'video'}}))}}>{t('chat:creation.settings')}</Button></div>}
              <Button
                disabled={
                  busy || plan.videoRuntimeReady===false || plan.available < (plan.requiredSpace??plan.total + 256 * 1024 * 1024)
                }
                onClick={async () => {
                  setBusy(true)
                  setError(false)
                  try {
                    await installAction('start', plan.token)
                    if((all||music)&&scope)useCreationInstall.getState().requestAutomatic(plan.token,scope)
                    setPlan(undefined)
                    onStarted?.()
                  } catch {
                    setError(true)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {t('hub:download')}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setPlan(undefined)}
              >
                {t('common:cancel')}
              </Button>
              {error && <p role="alert">{t('chat:creationInstall.error')}</p>}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export function CreationInstallIndicator() {

  const { t } = useTranslation()
  const service = useServiceHub()
  const job = useCreationInstall((s) => s.job)
  const autoApply = useCreationInstall((s)=>s.autoApply)
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const automatic=job?autoApply[job.plan.token]:undefined
  if (
    !job ||
    job.phase === 'cancelled' ||
    (job.phase === 'ready' && job.acknowledged && !open && (!automatic||automatic.done))
  )
    return null
  const ready = job.phase === 'ready'
  const configuring=ready&&automatic&&!automatic.done&&!automatic.error
  const percent = Math.min(
    100,
    Math.floor((job.bytes.reduce((a, b) => a + b, 0) / job.plan.total) * 100)
  )
  async function act(action: string) {
    setBusy(true)
    setError(false)
    try {
      await installAction(action)
    } catch {
      setError(true)
    } finally {
      setBusy(false)
    }
  }
  const label = t(
    automatic?.error ? 'common:errorDialog.titleFallback' : configuring ? 'chat:creation.setupConfiguring' : job.phase === 'downloading'
      ? 'hub:download'
      : `chat:creationInstall.${job.phase}`
  )
  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next && ready && !job.acknowledged) void act('acknowledge')
      }}
    >
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="relative z-50 shrink-0 gap-1"
          aria-label={`${label} ${ready ? '' : `${percent}%`}`}
        >
          {ready&&!configuring&&!automatic?.error ? <IconCircleCheck size={16} /> : <IconDownload size={16} />}
          <span className="text-xs">{ready ? label : `${percent}%`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[75vh] overflow-y-auto space-y-3">
        <p role="status" className="text-sm font-medium">
          {label}
        </p>
        <p className="text-xs">
          {job.plan.variant==='all-recommended'?`${t('chat:creation.text')} · ${t('providers:embeddingModels')} · ${t('chat:creation.image')} · Real-ESRGAN · ${t('chat:creation.music')} · ${t('chat:creation.video')}`:job.plan.variant==='music-gguf'?t('ui:aceStep15Turbo2bQ4K'):job.plan.variant==='video-gguf'?t('ui:wan21T2v13bQ4KM'):job.plan.variant==='upscale'?'Real-ESRGAN':`FLUX.2 Klein 4B · ${job.plan.variant?.startsWith('nvfp4')?t('ui:nvfp4'):'GGUF'}`}
        </p>
        {!ready && (
          <p className="text-xs text-muted-foreground">
            {t('chat:creationInstall.background')}
          </p>
        )}
        <progress
          className="w-full"
          max={100}
          value={percent}
          aria-label={label}
        />
        {job.plan.files.map((file, index) => (
          <div className="space-y-1 text-xs" key={file.role}>
            <p className="break-words">{file.name}</p>
            <p>
              {formatBytes(job.bytes[index])} / {formatBytes(file.size)}{' '}
              {job.verified[index] ? '✓' : ''}
            </p>
            <progress
              className="w-full"
              max={file.size}
              value={job.bytes[index]}
              aria-label={file.name}
            />
          </div>
        ))}
        <p className="break-all text-xs text-muted-foreground">
          {job.plan.directory}
        </p>
        {(error || job.phase === 'error' || automatic?.error) && (
          <p role="alert" className="text-xs">
            {job.error==='space'?t('chat:creation.setupSpaceMissing',{missing:formatBytes(Math.max(0,(job.plan.requiredSpace??job.plan.total+256*1024*1024)-job.plan.available))}):t('chat:creationInstall.error')}
            {automatic?.detail&&<span className="mt-1 block break-words">{automatic.detail}</span>}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ready ? (
            <>
              <Button
                size="sm"
                disabled={busy||!!configuring}
                onClick={async () => {
                  setBusy(true)
                  try {await applyInstalled(job,automatic?.scope);if(automatic)useCreationInstall.getState().finishAutomatic(job.plan.token);await act('acknowledge')}
                  catch(error) {setError(true);if(automatic)useCreationInstall.getState().finishAutomatic(job.plan.token,true,String(error).slice(0,1600))}
                  finally {setBusy(false)}
                }}
              >
                {t('chat:creationInstall.use')}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  void service
                    .opener()
                    .revealItemInDir(
                      `${job.plan.directory}/${job.plan.files[0].name}`
                    )
                }
              >
                {t('chat:creation.openFolder')}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={async () => {
                  await act('acknowledge')
                  setOpen(false)
                }}
              >
                {t('common:confirm')}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                disabled={
                  busy ||
                  (!job.running && !['paused', 'error'].includes(job.phase)) ||
                  (job.running && ['paused', 'error'].includes(job.phase))
                }
                onClick={() => void act(job.running ? 'pause' : 'resume')}
              >
                {t(`chat:creationInstall.${job.running ? 'pause' : 'resume'}`)}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={busy}
                onClick={() => void act('cancel')}
              >
                {t('common:cancel')}
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
