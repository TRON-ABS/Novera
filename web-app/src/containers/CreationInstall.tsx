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
import { useCreation } from '@/hooks/useCreation'
import { formatBytes } from '@/lib/utils'

export function CreationInstallButton({
  onStarted,
}: { onStarted?: () => void } = {}) {
  const { t } = useTranslation()
  const service = useServiceHub()
  const { parent, setParent, job } = useCreationInstall()
  const python = useCreation((s) => s.settings.python)
  const [fp4, setFp4] = useState(false)
  useEffect(() => {
    let active = true
    setFp4(false)
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
  }, [python])
  const [plan, setPlan] = useState<InstallPlan>()
  const [error, setError] = useState(false)
  const [busy, setBusy] = useState(false)
  async function prepare(folder = parent, variant = 'gguf') {
    setBusy(true)
    setError(false)
    try {
      setPlan(
        await invoke<InstallPlan>('creation_bundle_plan', {
          parent: folder || null,
          variant,
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
        disabled={busy || (job && !['ready', 'cancelled'].includes(job.phase))}
        onClick={() => void prepare()}
      >
        <IconDownload size={14} />
        {t('chat:creationInstall.install')}
      </Button>
      <Button
        variant="outline"
        size="sm"
        disabled={
          !fp4 || busy || (job && !['ready', 'cancelled'].includes(job.phase))
        }
        onClick={() => void prepare(parent, 'nvfp4')}
      >
        NVFP4 CUDA · FLUX.2 Klein 4B
      </Button>

      <p className="text-xs text-muted-foreground">
        {t(fp4 ? 'hub:catalog.nvfp4Prefer' : 'chat:creation.nativeNote')}
      </p>
      {job?.phase === 'ready' && (
        <Button variant="outline" size="sm" onClick={() => applyInstalled(job)}>
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
            <DialogTitle>{t('chat:creationInstall.install')}</DialogTitle>
            <DialogDescription>
              {t('chat:creationInstall.confirm')}
            </DialogDescription>
          </DialogHeader>
          {plan && (
            <>
              <p className="text-sm">{t('chat:creationInstall.background')}</p>
              <p className="text-xs text-muted-foreground">
                {t(
                  plan.variant === 'nvfp4'
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
              <div className="text-xs underline flex gap-3">
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
              </div>
              <p className="text-sm" role="status">
                {t('chat:creationInstall.space', {
                  total: formatBytes(plan.total),
                  free: formatBytes(plan.available),
                })}
              </p>
              <Button
                disabled={
                  busy || plan.available < plan.total + 256 * 1024 * 1024
                }
                onClick={async () => {
                  setBusy(true)
                  setError(false)
                  try {
                    await installAction('start', plan.token)
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
  const [open, setOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  if (
    !job ||
    job.phase === 'cancelled' ||
    (job.phase === 'ready' && job.acknowledged && !open)
  )
    return null
  const ready = job.phase === 'ready'
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
    job.phase === 'downloading'
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
          {ready ? <IconCircleCheck size={16} /> : <IconDownload size={16} />}
          <span className="text-xs">{ready ? label : `${percent}%`}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-[75vh] overflow-y-auto space-y-3">
        <p role="status" className="text-sm font-medium">
          {label}
        </p>
        <p className="text-xs">
          FLUX.2 Klein 4B
          {job.plan.variant?.startsWith('nvfp4') ? ' · NVFP4' : ' · GGUF'}
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
        {(error || job.phase === 'error') && (
          <p role="alert" className="text-xs">
            {t('chat:creationInstall.error')}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {ready ? (
            <>
              <Button
                size="sm"
                disabled={busy}
                onClick={() => {
                  applyInstalled(job)
                  void act('acknowledge')
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
