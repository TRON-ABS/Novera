import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useHardware } from '@/hooks/useHardware'
import { isPlatformTauri } from '@/lib/platform/utils'
import { componentAction, componentCompatibility, componentStatus, recommendedComponents, type ComponentAction, type ComponentStatus } from '@/services/components'
import { reportDiagnostic } from '@/lib/noveraDiagnostics'
import { intlLocale } from '@/utils/intlLocale'

const names = { transformers: 'Transformers / Safetensors', onnx: 'ONNX Runtime', media: 'Diffusers', video: 'FFmpeg', upscale: 'Real-ESRGAN' }

/** No download occurs on mount. Native operations survive navigation. */
export function ManagedComponents({ disabled = false }: { disabled?: boolean }) {
  const { t, i18n } = useTranslation()
  const hardware = useHardware(s => s.hardwareData)
  const [status, setStatus] = useState<ComponentStatus>()
  const [error, setError] = useState('')
  const [pending, setPending] = useState<{ id: string; action: ComponentAction }>()
  const [submitting, setSubmitting] = useState(false)
  const [advanced, setAdvanced] = useState(false)
  const reported = useRef('')
  const native = isPlatformTauri() && !IS_ANDROID && !IS_IOS
  useEffect(() => {
    if (!native) return
    let active = true
    let timer: ReturnType<typeof setTimeout>
    const refresh = async () => {
      try { const value = await componentStatus(); if (active) { setStatus(value); setError('') } }
      catch { if (active) setError('COMPONENT_STATUS') }
      if (active) timer = setTimeout(() => void refresh(), 1500)
    }
    void refresh()
    return () => { active = false; clearTimeout(timer) }
  }, [native])
  const nvidia = hardware.gpus.some(g => g.activated !== false && /nvidia/i.test(`${g.vendor} ${g.name}`))
  const recommendations = recommendedComponents(status?.profiles ?? [], nvidia)
  const bytes = (value: number) => `${new Intl.NumberFormat(intlLocale(i18n?.language ?? 'en'), { maximumFractionDigits: 1 }).format(value / 1024 ** 3)} GiB`
  const running = status?.operation?.running || submitting
  useEffect(() => {
    const operation = status?.operation
    if (operation?.error && operation.phase === 'error' && !operation.running && reported.current !== operation.id) {
      reported.current = operation.id
      reportDiagnostic(new Error(operation.error), { operation: 'configuration' })
    }
  }, [status?.operation])
  const act = async (id: string, action: ComponentAction) => {
    setSubmitting(true)
    try {
      await componentAction(id, action)
      setPending(undefined)
      setStatus(await componentStatus())
      window.dispatchEvent(new Event('novera-components-changed'))
    } catch (reason) {
      const code = String(reason).match(/COMPONENT_[A-Z_]+/)?.[0] ?? 'COMPONENT_FAILED'
      setError(code)
      reportDiagnostic(new Error(code), { operation: 'configuration' })
    } finally { setSubmitting(false) }
  }
  const selected = status?.profiles.find(row => row.profile.id === pending?.id)?.profile
  return <section className="space-y-3 rounded-xl border p-4 [&_button]:max-w-full [&_button]:whitespace-normal" aria-label={t('common:components.title')}>
    <h2 className="font-medium">{t('common:components.title')}</h2>
    <p className="text-sm text-muted-foreground">{t('common:components.note')}</p>
    <p className="text-xs break-words">{t('common:hardware')} · {hardware.cpu.name || '—'} · RAM {hardware.total_memory ? bytes(hardware.total_memory * 1024 ** 2) : '—'} · {hardware.gpus.map(g => g.name).join(', ') || '—'}</p>
    {!native && <p>{t('common:editModel.notAvailable')}</p>}
    {error && <p role="alert" className="text-sm">{t(error === 'COMPONENT_BUSY' ? 'common:components.busy' : 'common:components.failed')} <code>{error}</code></p>}
    {status?.operation && <div role="status" aria-live="polite" className="space-y-1 text-sm">
      <span>{status.operation.profile} · {status.operation.phase === 'python' ? 'Python' : t(status.operation.running ? status.operation.phase === 'verifying' ? 'chat:creationInstall.verifying' : status.operation.phase === 'installing' ? 'chat:creationInstall.install' : 'chat:creation.loading' : status.operation.phase === 'ready' ? 'common:done' : status.operation.phase === 'cancelled' ? 'common:cancel' : 'common:components.failed')}</span>
      {status.operation.running && <><progress className="block w-full" aria-label={t('chat:creation.loading')} /><Button size="sm" variant="outline" onClick={() => void act('', 'cancel')}>{t('common:cancel')}</Button></>}
      {status.operation.error && <details><summary>{t('common:errorDialog.details')}</summary><code>{status.operation.error}</code></details>}
      {status.operation.error === 'COMPONENT_BUSY' && <p>{t('common:components.busy')}</p>}
    </div>}
    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={advanced} onChange={event => setAdvanced(event.target.checked)} />{t('common:composer.advanced')}</label>
    {status?.profiles.filter(row => advanced || recommendations.has(row.profile.id)).map(({ profile, state, selected: active, canRollback }) => {
      const compatible = componentCompatibility(profile, nvidia)
      const blocked = !!running || disabled
      return <article key={profile.id} className="space-y-2 rounded-lg border p-3">
        <h3 className="text-sm font-medium">{t(profile.family === 'transformers' || profile.family === 'onnx' ? 'chat:creation.text' : profile.family === 'media' ? 'chat:creation.image' : profile.family === 'video' ? 'chat:creation.video' : 'chat:creation.upscaleTitle')}{profile.family === 'media' && ` / ${t('chat:creation.video')}`} · {profile.family !== 'upscale' && `${names[profile.family]} · `}{profile.id === 'exllama' ? 'ExLlama' : profile.id === 'onnx-genai' ? 'GenAI' : profile.backend === 'cpu' ? 'CPU' : 'CUDA'} {active && '✓'}</h3>
        {recommendations.has(profile.id) && <p className="text-xs">{t('common:askRecommended')}</p>}
        <p className="text-xs">{t(state === 'ready' ? 'chat:creationInstall.ready' : state === 'outdated' ? 'common:components.updateAvailable' : state === 'error' ? 'common:components.failed' : 'common:components.missing')} · {t(compatible ? 'hub:catalog.check' : 'common:editModel.notAvailable')}</p>
        <p className="text-xs">{t('common:components.estimates', { download: bytes(profile.downloadBytes), space: bytes(profile.requiredBytes), free: bytes(status.freeBytes) })}</p>
        <div className="flex flex-wrap gap-2">
          {state !== 'ready' && <Button size="sm" variant="outline" disabled={blocked || !compatible || status.freeBytes < profile.requiredBytes} onClick={() => setPending({ id: profile.id, action: state === 'outdated' ? 'update' : state === 'error' ? 'repair' : 'install' })}>{t(state === 'outdated' ? 'common:components.update' : 'chat:creationInstall.install')}</Button>}
          {state === 'ready' && <>
            <Button size="sm" variant="outline" disabled={blocked} onClick={() => void act(profile.id, 'verify')}>{t('common:components.verify')}</Button>
            <Button size="sm" variant="outline" disabled={blocked} onClick={() => setPending({ id: profile.id, action: 'repair' })}>{t('common:components.repair')}</Button>
            <Button size="sm" variant="outline" disabled={blocked} onClick={() => void act(profile.id, 'select')}>{t('chat:creationInstall.use')}</Button>
            {canRollback && <Button size="sm" variant="outline" disabled={blocked} onClick={() => void act(profile.id, 'rollback')}>{t('common:components.rollback')}</Button>}
          </>}
          {state !== 'absent' && <Button size="sm" variant="outline" disabled={blocked} onClick={() => setPending({ id: profile.id, action: 'uninstall' })}>{t('common:components.uninstall')}</Button>}
        </div>
        <details className="text-xs"><summary>{t('common:errorDialog.details')}</summary><p dir="ltr">{profile.id} · Python {profile.python} · {profile.backend}</p></details>
      </article>
    })}
    <Dialog open={!!pending} onOpenChange={open => { if (!open && !submitting) setPending(undefined) }}>
      <DialogContent>
        <DialogHeader><DialogTitle>{t('common:components.title')}</DialogTitle><DialogDescription>{t(pending?.action === 'uninstall' ? 'common:components.removeConfirm' : 'common:components.confirm')}</DialogDescription></DialogHeader>
        <p>{selected?.id}</p>
        {selected && status && <p className="text-sm">{t('common:components.estimates', { download: bytes(selected.downloadBytes), space: bytes(selected.requiredBytes), free: bytes(status.freeBytes) })}</p>}
        <div className="flex flex-wrap gap-2"><Button disabled={submitting || disabled} onClick={() => pending && void act(pending.id, pending.action)}>{t('common:confirm')}</Button><Button variant="outline" disabled={submitting} onClick={() => setPending(undefined)}>{t('common:cancel')}</Button></div>
      </DialogContent>
    </Dialog>
  </section>
}
