import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'

type Probe = { logits: Float32Array; tokens: number[] }
type Quantized = { blob: Blob; inputBytes: number; outputBytes: number; elapsedMs: number; maxKl?: number }
const runtime = import.meta.env.VITE_NOVERA_BROWSER_TEXT_PATH
export const browserQuantizationAvailable = import.meta.env.VITE_NOVERA_BROWSER_QUANTIZATION === true
const prompts = [
  'Un train parcourt 180 kilomètres en deux heures. Sa vitesse moyenne est',
  'The first three prime numbers are 2, 3, and',
  'def square(x):\n    return x',
]

function divergence(reference: Probe, candidate: Probe) {
  if (reference.logits.length !== candidate.logits.length ||
      JSON.stringify(reference.tokens) !== JSON.stringify(candidate.tokens)) throw new Error('Token mismatch')
  function normalizer(logits: Float32Array) {
    let max = -Infinity
    for (const x of logits) {
      if (!Number.isFinite(x)) throw new Error('Invalid logits')
      max = Math.max(max, x)
    }
    let sum = 0
    for (const x of logits) sum += Math.exp(x - max)
    return max + Math.log(sum)
  }
  const p = normalizer(reference.logits)
  const q = normalizer(candidate.logits)
  let kl = 0
  for (let i = 0; i < reference.logits.length; i++) {
    const logp = reference.logits[i] - p
    kl += Math.exp(logp) * (logp - candidate.logits[i] + q)
  }
  return Math.max(0, kl)
}

export function BrowserModelQuantization() {
  const { t, i18n } = useTranslation()
  const french = i18n.language === 'fr'
  const [file, setFile] = useState<File>()
  const [importanceMatrix, setImportanceMatrix] = useState<File>()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [result, setResult] = useState<Quantized>()
  const worker = useRef<Worker | null>(null)
  const url = useRef<string | undefined>(undefined)
  useEffect(() => () => {
    worker.current?.terminate()
    if (url.current) URL.revokeObjectURL(url.current)
  }, [])
  if (!browserQuantizationAvailable || !runtime) return null

  function stop() {
    worker.current?.terminate()
    worker.current = null
    setBusy(false)
  }

  function start() {
    if (!file || worker.current) return
    setBusy(true)
    setFailed(false)
    setResult(undefined)
    try {
      const base = new URL(import.meta.env.BASE_URL, window.location.href)
      const task = new Worker(new URL(runtime + '/worker.mjs', base), { type: 'module' })
      worker.current = task
      let output: Quantized | undefined
      let candidate = false
      let index = 0
      const reference: Probe[] = []
      const scores: number[] = []
      task.onerror = () => { setFailed(true); stop() }
      task.onmessage = ({ data }) => {
        try {
          if (data.type === 'error') throw new Error(data.error)
          if (data.type === 'quantized') {
            output = data
            setResult(data)
            task.postMessage({ type: 'load', localFile: file })
          } else if (data.type === 'ready') {
            task.postMessage({ type: 'probe-logits', prompt: prompts[index] })
          } else if (data.type === 'logits') {
            if (candidate) scores.push(divergence(reference[index], data))
            else reference.push(data)
            if (++index < prompts.length) {
              task.postMessage({ type: 'probe-logits', prompt: prompts[index] })
            } else if (!candidate) {
              task.postMessage({ type: 'unload' })
            } else if (output) {
              setResult({ ...output, maxKl: Math.max(...scores) })
              stop()
            }
          } else if (data.type === 'unloaded' && output) {
            candidate = true
            index = 0
            task.postMessage({ type: 'load', localFile: output.blob })
          }
        } catch {
          setFailed(true)
          stop()
        }
      }
      task.postMessage({ type: 'quantize-q4', localFile: file, importanceMatrix })
    } catch {
      setFailed(true)
      stop()
    }
  }

  function save(blob: Blob) {
    if (url.current) URL.revokeObjectURL(url.current)
    url.current = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url.current
    link.download = 'Novera-' + file?.name.replace(/\.gguf$/i, '') + (importanceMatrix ? '-Q4-mixed.gguf' : '-Q4_K_M.gguf')
    link.click()
  }

  return <section className="grid gap-2 rounded border p-3">
    <label className="grid gap-1">
      {french ? 'Modèle GGUF de référence (Q8 ou supérieur)' : 'Reference GGUF model (Q8 or higher)'}
      <input type="file" accept=".gguf" disabled={busy} onChange={event => {
        setFile(event.currentTarget.files?.[0])
        setResult(undefined)
        setFailed(false)
      }} />
    </label>
    <label className="grid gap-1">
      {french ? 'Matrice d’importance GGUF du modèle (optionnelle)' : 'Model GGUF importance matrix (optional)'}
      <input type="file" accept=".gguf" disabled={busy} onChange={event => {
        setImportanceMatrix(event.currentTarget.files?.[0])
        setResult(undefined)
        setFailed(false)
      }} />
    </label>
    <Button type="button" disabled={busy || !file || file.size >= 2 ** 32} onClick={start}>
      {importanceMatrix ? (french ? 'Quantifier en Q4 mixte' : 'Quantize to mixed Q4')
        : (french ? 'Quantifier en Q4_K_M' : 'Quantize to Q4_K_M')}
    </Button>
    {busy && <>
      <progress aria-label={french ? 'Quantification en cours' : 'Quantization in progress'} />
      <Button type="button" variant="destructive" onClick={stop}>{t('ui:modelAdjustmentStop')}</Button>
    </>}
    {failed && <p role="alert">{t('ui:modelAdjustmentFailed')}</p>}
    {result && <>
      <p role="status">{(result.outputBytes / 1e6).toFixed(1)} MB · {(result.elapsedMs / 1000).toFixed(1)} s · {new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 }).format(1 - result.outputBytes / result.inputBytes)}
        {result.maxKl !== undefined && <> · {t('ui:modelAdjustmentMax')} ({prompts.length}): {result.maxKl.toPrecision(5)} nat</>}
      </p>
      <Button type="button" onClick={() => save(result.blob)}>{t('ui:modelAdjustmentSave')}</Button>
    </>}
  </section>
}
