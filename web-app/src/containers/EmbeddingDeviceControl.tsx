import { useEffect, useState } from 'react'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useTranslation } from '@/i18n/react-i18next-compat'

/** Per-model placement, saved in model.yml through the existing model service. */
export function EmbeddingDeviceControl({ modelId }: { modelId: string }) {
  const { t } = useTranslation()
  const models = useServiceHub().models()
  const [device, setDevice] = useState<'cpu' | 'gpu'>('cpu')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState<string>()
  useEffect(() => {
    let disposed = false
    setLoading(true)
    setReady(false)
    setError(undefined)
    models.getEmbeddingDevice(modelId).then((value) => {
      if (!disposed) { setDevice(value); setLoading(false); setReady(true) }
    }).catch((reason) => {
      if (!disposed) { setError(String(reason)); setLoading(false) }
    })
    return () => { disposed = true }
  }, [models, modelId])

  return (
    <div className="flex flex-col items-end gap-1">
      <label className="flex items-center gap-2 text-xs">
        {t('ui:deviceLabel')}
        <select className="rounded border bg-background p-1.5" value={device}
          aria-label={`${t('providers:embeddingModels')} · CPU / GPU`}
          disabled={loading || saving || !ready}
          onChange={async (event) => {
            const next = event.target.value as 'cpu' | 'gpu'
            setSaving(true)
            setError(undefined)
            try {
              await models.updateModelSettings(modelId, { ngl: next === 'cpu' ? 0 : -1 })
              setDevice(next)
            } catch (reason) { setError(String(reason)) }
            finally { setSaving(false) }
          }}>
          <option value="cpu">CPU</option>
          <option value="gpu">GPU</option>
        </select>
      </label>
      {error && <span role="alert" className="text-xs text-destructive">{error}</span>}
    </div>
  )
}
