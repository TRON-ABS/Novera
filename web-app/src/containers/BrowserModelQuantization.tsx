import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { browserLargeTextSupported } from '@/services/browser-preview/wasm-text'

type Probe = { logits: Float32Array; tokens: number[]; vocab: number; positions: number }
type CorpusResult = { mean: number; max: number }
type Quantized = { blob: Blob; inputBytes: number; outputBytes: number; elapsedMs: number }
const runtime = browserLargeTextSupported()
  ? import.meta.env.VITE_NOVERA_BROWSER_TEXT64_PATH
  : import.meta.env.VITE_NOVERA_BROWSER_TEXT_PATH
export const browserQuantizationAvailable = import.meta.env.VITE_NOVERA_BROWSER_QUANTIZATION === true
const corpora = [
  [new URL('../../../scripts/validation/q4-quantization/validation.txt', import.meta.url), 6],
  [new URL('../../../scripts/validation/q4-quantization/validation-independent.txt', import.meta.url), 6],
  [new URL('../../../scripts/validation/q4-quantization/transfer.txt', import.meta.url), 4],
  [new URL('../../../scripts/validation/q4-quantization/holdout-4.txt', import.meta.url), 4],
  [new URL('../../../scripts/validation/q4-quantization/holdout-5.txt', import.meta.url), 4],
] as const

type ReferenceChunk = Omit<Probe, 'logits'> & {
  values: Uint16Array
  minimums: Float32Array
  scales: Float32Array
}

function logNormalizer(logits: Float32Array, max: number) {
  let sum = 0
  for (const value of logits) sum += Math.fround(Math.exp(Math.fround(value - max)))
  return Math.fround(Math.log(sum))
}

// Match the 16-bit reference cache used by llama-perplexity.
function compressReference({ logits, ...metadata }: Probe): ReferenceChunk {
  const { vocab, positions } = metadata
  const values = new Uint16Array(logits.length)
  const minimums = new Float32Array(positions)
  const scales = new Float32Array(positions)
  for (let position = 0; position < positions; position++) {
    const offset = position * vocab
    const row = logits.subarray(offset, offset + vocab)
    let max = -Infinity
    let min = Infinity
    for (const value of row) {
      max = Math.max(max, value)
      min = Math.min(min, value)
    }
    if (!Number.isFinite(min) || !Number.isFinite(max)) throw new Error('Invalid reference logits')
    min = Math.max(min, Math.fround(max - 16))
    minimums[position] = Math.fround(Math.fround(min - max) - logNormalizer(row, max))
    const scale = Math.fround(Math.fround(max - min) / 65535)
    scales[position] = scale
    if (!scale) continue
    const inverse = Math.fround(1 / scale)
    for (let id = 0; id < vocab; id++) {
      values[offset + id] = Math.min(65535, Math.max(0, Math.round(Math.fround(inverse * Math.fround(row[id] - min)))))
    }
  }
  return { ...metadata, values, minimums, scales }
}

function divergence(reference: ReferenceChunk, position: number, candidate: Float32Array) {
  let max = -Infinity
  for (const value of candidate) max = Math.max(max, value)
  if (!Number.isFinite(max)) throw new Error('Invalid candidate logits')
  const normalizer = Math.fround(max + logNormalizer(candidate, max))
  const offset = position * reference.vocab
  let kl = 0
  for (let id = 0; id < candidate.length; id++) {
    const logp = Math.fround(Math.fround(reference.scales[position] * reference.values[offset + id]) + reference.minimums[position])
    if (logp > -16) {
      kl += Math.fround(Math.fround(Math.exp(logp)) * Math.fround(Math.fround(logp - candidate[id]) + normalizer))
    }
  }
  return kl
}

export function BrowserModelQuantization() {
  const { t, i18n } = useTranslation()
  const french = i18n.language === 'fr'
  const number = new Intl.NumberFormat(i18n.language, { maximumFractionDigits: 6 })
  const sizePercent = new Intl.NumberFormat(i18n.language, { style: 'percent', maximumFractionDigits: 2 })
  const [file, setFile] = useState<File>()
  const [importanceMatrix, setImportanceMatrix] = useState<File>()
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const [result, setResult] = useState<Quantized>()
  const [scores, setScores] = useState<CorpusResult[]>([])
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
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
    setError('')
    setResult(undefined)
    setScores([])
    setProgress(0)
    try {
      const base = new URL(import.meta.env.BASE_URL, window.location.href)
      const task = new Worker(new URL(runtime + '/worker.mjs', base), { type: 'module' })
      worker.current = task
      let output: Quantized | undefined
      let candidate = false
      let corpusIndex = 0
      let chunk = 0
      let corpus = ''
      let sum = 0
      let count = 0
      let max = -Infinity
      const reference: ReferenceChunk[] = []
      const fail = (cause: unknown) => {
        setError(cause instanceof Error ? cause.message : String(cause))
        setFailed(true)
        stop()
      }
      const loadCorpus = async () => {
        const response = await fetch(corpora[corpusIndex][0])
        if (!response.ok) throw new Error('Corpus unavailable')
        corpus = (await response.text()).replaceAll('\r\n', '\n')
        if (worker.current === task) task.postMessage({ type: 'load', localFile: file, benchmark: true })
      }
      const probe = () => task.postMessage({ type: 'probe-chunk', corpus, chunk })
      const advance = () => {
        if (candidate && chunk !== reference.length) throw new Error('Corpus length mismatch')
        if (candidate && !count) throw new Error('Empty corpus')
        task.postMessage({ type: 'unload' })
      }
      task.onerror = event => {
        if (worker.current === task) fail(event.message || 'Browser runtime failed')
      }
      task.onmessage = async ({ data }) => {
        if (worker.current !== task) return
        try {
          if (data.type === 'error') throw new Error(data.error)
          if (data.type === 'quantized') {
            output = data
            setResult(data)
            await loadCorpus()
          } else if (data.type === 'ready') {
            probe()
          } else if (data.type === 'chunk-end') {
            advance()
          } else if (data.type === 'chunk-logits') {
            const probeResult: Probe = data
            if (candidate) {
              const original = reference[chunk]
              if (!original || original.vocab !== probeResult.vocab || original.positions !== probeResult.positions ||
                  original.tokens.some((token, index) => token !== probeResult.tokens[index])) {
                throw new Error('Token mismatch')
              }
              const { vocab, positions, logits } = probeResult
              for (let position = 0; position < positions; position++) {
                const start = position * vocab
                const score = divergence(original, position, logits.subarray(start, start + vocab))
                sum += score
                max = Math.max(max, score)
                count++
              }
            } else {
              reference.push(compressReference(probeResult))
            }
            chunk++
            const limit = candidate ? reference.length : corpora[corpusIndex][1]
            if (chunk === limit) advance()
            else probe()
          } else if (data.type === 'unloaded' && output) {
            chunk = 0
            if (!candidate) {
              candidate = true
              task.postMessage({ type: 'load', localFile: output.blob, benchmark: true })
              return
            }
            const score = { mean: sum / count, max }
            setScores(previous => [...previous, score])
            setProgress(++corpusIndex)
            if (corpusIndex === corpora.length) {
              stop()
              return
            }
            candidate = false
            reference.length = 0
            sum = count = 0
            max = -Infinity
            await loadCorpus()
          }
        } catch (cause) {
          if (worker.current === task) fail(cause)
        }
      }
      task.postMessage({ type: 'quantize-q4', localFile: file, importanceMatrix })
    } catch (cause) {
      setError(String(cause))
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
        setScores([])
        setFailed(false)
      }} />
    </label>
    <label className="grid gap-1">
      {french ? 'Matrice d’importance GGUF du modèle (optionnelle)' : 'Model GGUF importance matrix (optional)'}
      <input type="file" accept=".gguf" disabled={busy} onChange={event => {
        setImportanceMatrix(event.currentTarget.files?.[0])
        setResult(undefined)
        setScores([])
        setFailed(false)
      }} />
    </label>
    <Button type="button" disabled={busy || !file || file.size >= 2 ** 32} onClick={start}>
      {importanceMatrix ? (french ? 'Quantifier en Q4 mixte' : 'Quantize to mixed Q4')
        : (french ? 'Quantifier en Q4_K_M' : 'Quantize to Q4_K_M')}
    </Button>
    {busy && <>
      <progress max={corpora.length} value={result ? progress : undefined} aria-label={french ? 'Quantification en cours' : 'Quantization in progress'} />
      <Button type="button" variant="destructive" onClick={stop}>{t('ui:modelAdjustmentStop')}</Button>
    </>}
    {failed && <p role="alert">{error}</p>}
    {result && <>
      <div className="overflow-x-auto rounded-md border">
        <table className="w-full text-sm" aria-label={t('ui:modelAdjustmentResults')}>
          <thead className="bg-muted text-muted-foreground">
            <tr>
              <th scope="col" className="px-2 py-2 text-left">{t('ui:modelAdjustmentModel')}</th>
              <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentSize')}</th>
              <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentMean')}</th>
              <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentMax')}</th>
              <th scope="col" className="px-2 py-2 text-right">{t('ui:modelAdjustmentByCorpus')}</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t tabular-nums text-emerald-700 dark:text-emerald-300">
              <th scope="row" className="px-2 py-2 text-left text-foreground">{importanceMatrix ? t('ui:modelAdjustmentCandidate') : 'Q4_K_M'}</th>
              <td className="px-2 py-2 text-right">{number.format(Math.round(result.outputBytes / 1e6))} ({sizePercent.format(1 - result.outputBytes / result.inputBytes)})</td>
              <td className="px-2 py-2 text-right">{scores.length ? number.format(scores.reduce((sum, score) => sum + score.mean, 0) / scores.length) : '—'}</td>
              <td className="px-2 py-2 text-right">{scores.length ? number.format(Math.max(...scores.map(score => score.max))) : '—'}</td>
              <td className="px-2 py-2 text-right">{scores.map((score, index) => <div key={index}>{index + 1} · {number.format(score.max)}</div>)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <Button type="button" disabled={busy} onClick={() => save(result.blob)}>{t('ui:modelAdjustmentSave')}</Button>
    </>}
  </section>
}
