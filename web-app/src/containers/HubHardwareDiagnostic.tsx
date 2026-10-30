import { useRef, useState } from 'react'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useHardware } from '@/hooks/useHardware'
import { useServiceHub } from '@/hooks/useServiceHub'
import { useGeneralSetting } from '@/hooks/useGeneralSetting'
import type { CatalogModel, ModelQuant } from '@/services/models/types'
import {
  diagnoseHubModel,
  modelCategories,
  modelEngine,
  type HubDiagnosis,
  type HubRuntime,
} from '@/modules/engines/hub-catalog'
import { ExtensionManager } from '@/lib/extension'
import { hubFormatBytes, hubHardwareSnapshot, hubMemoryOptions } from '@/lib/hubDiscovery'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const engineNames = {
  llamacpp: 'llama.cpp / GGUF',
  mlx: 'MLX / Apple Silicon',
  transformers: 'Transformers / Safetensors',
  future: '—',
}

export function useHubDiagnosis(
  model: CatalogModel,
  variant?: Partial<ModelQuant>,
  context = 8192,
  runtime?: HubRuntime
): HubDiagnosis {
  const hardware = useHardware((state) => state.hardwareData)
  const usage = useHardware((state) => state.systemUsage) ?? {
    total_memory: 0,
    used_memory: 0,
    gpus: [],
  }
  const snapshot = hubHardwareSnapshot(hardware, usage)
  return diagnoseHubModel(model, {
    ...snapshot,
    platform: IS_WINDOWS ? 'windows' : IS_MACOS ? 'macos' : IS_LINUX ? 'linux' : snapshot.platform || 'web',
  }, { ...hubMemoryOptions(model, variant, context), runtime })
}

function DiagnosisDetails({
  model,
  variant,
  context,
  runtime,
}: {
  model: CatalogModel
  variant?: Partial<ModelQuant>
  context: number
  runtime?: HubRuntime
}) {
  const { t, i18n } = useTranslation()
  const diagnosis = useHubDiagnosis(model, variant, context, runtime)
  const bytes = (value: number | null) => hubFormatBytes(value, i18n.language)
  return (
    <div className="space-y-3 text-sm">
      <div className="flex flex-wrap gap-2">
        {modelCategories(model).map((category) => (
          <span
            className="rounded-full border px-2 py-1 text-xs"
            key={category}
          >
            {t(`hub:catalog.${category}`)}
          </span>
        ))}
      </div>
      <div className="rounded-lg border p-3 space-y-2">
        <p
          className={
            diagnosis.memory === 'insufficient'
              ? 'text-amber-600 dark:text-amber-400'
              : 'font-medium'
          }
        >
          {t(`hub:catalog.${diagnosis.memory}`)}
        </p>
        <p>
          {t('hub:catalog.engine')}:{' '}
          {diagnosis.nvfp4Advice === 'nvfp4Prefer'
            ? 'NVFP4 CUDA · PyTorch'
            : diagnosis.quantization === 'exl3' ? 'ExLlamaV3 / EXL3'
            : diagnosis.quantization === 'exl2' ? 'ExLlamaV2 / EXL2'
            : engineNames[diagnosis.engine]}{' '}
          {diagnosis.quantization && ` · ${diagnosis.quantization} `}
          · {t(`hub:catalog.${diagnosis.engineState}`)}
        </p>
      </div>
      {diagnosis.nvfp4Advice && (
        <p className="rounded border p-2 text-xs">
          {t(`hub:catalog.${diagnosis.nvfp4Advice}`)}
        </p>
      )}
      {diagnosis.quantizationError && <p className="rounded border p-2 text-xs" role="status">{diagnosis.quantizationError}</p>}
      {model.quants?.length ? (
        <p className="text-xs text-muted-foreground">
          {t('hub:catalog.quantQualityAdvice')}
        </p>
      ) : null}
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <dt>{t('hub:discovery.weight')}</dt>
        <dd className="text-end">{bytes(diagnosis.downloadBytes)}</dd>
        <dt>{t('hub:discovery.memory')}</dt>
        <dd className="text-end">{bytes(diagnosis.requiredBytes)}</dd>
        <dt>{t('hub:catalog.ram')}</dt>
        <dd className="text-end">{bytes(diagnosis.ramBudgetBytes)}</dd>
        <dt>{t('hub:catalog.vram')}</dt>
        <dd className="text-end">{bytes(diagnosis.gpuBudgetBytes)}</dd>
        <dt>{t('hub:catalog.license')}</dt>
        <dd className="text-end break-all">
          {model.license ?? '—'}
          {model.gated ? ` · ${t('hub:catalog.gated')}` : ''}
        </dd>
      </dl>
      <p className="text-xs text-muted-foreground">
        {t('hub:catalog.estimateNote')}
      </p>
      {diagnosis.engine === 'transformers' && (
        <p className="text-xs text-muted-foreground">
          {t('hub:catalog.pythonNote')}
        </p>
      )}
      {runtime && (
        <p className="text-xs">
          Python {runtime.python} · PyTorch {runtime.torch} ·{' '}
          {runtime.cudaAvailable ? (runtime.gpu?.name ?? 'CUDA') : 'CPU'}
        </p>
      )}
      {diagnosis.medical && (
        <p className="rounded border p-2 text-xs">
          {t('hub:catalog.medicalNote')}
        </p>
      )}
      {model.pipeline_tag && (
        <p className="text-xs text-muted-foreground">
          Hugging Face · {model.pipeline_tag}
          {model.revision ? ` · ${model.revision.slice(0, 12)}` : ''}
        </p>
      )}
    </div>
  )
}

/** Every download entry point calls this before it starts transferring weights. */
export function useHubDownloadReview(
  model?: CatalogModel,
  initialVariant?: Partial<ModelQuant>
) {
  const { t } = useTranslation()
  const service = useServiceHub()
  const token = useGeneralSetting((state) => state.huggingfaceToken)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)
  const [reviewedModel, setReviewedModel] = useState<CatalogModel | undefined>(
    model
  )
  const [variant, setVariant] = useState<Partial<ModelQuant> | undefined>(
    initialVariant
  )
  const [context, setContext] = useState(8192)
  const [runtime, setRuntime] = useState<HubRuntime>()
  const [runtimeError, setRuntimeError] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const action = useRef<(() => unknown) | undefined>(undefined)
  const sequence = useRef(0)
  const fallback: CatalogModel = {
    model_name: '',
    downloads: 0,
    description: '',
  }
  const diagnosis = useHubDiagnosis(
    reviewedModel ?? model ?? fallback,
    variant,
    context,
    runtime
  )
  async function reviewDownload(
    download?: () => unknown,
    selected?: Partial<ModelQuant>
  ) {
    if (!model) return
    action.current = download
    setVariant(selected ?? initialVariant)
    setReviewedModel(model)
    setContext(8192)
    setRuntime(undefined)
    setRuntimeError('')
    setAcknowledged(false)
    setOpen(true)
    setFailed(false)
    const repo =
      model.hub?.repo ??
      (model.model_name.includes('/')
        ? model.model_name
        : `${model.developer}/${model.model_name}`)
    if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return
    const current = ++sequence.current
    setLoading(true)
    try {
      const detail = await service
        .models()
        .fetchHuggingFaceRepo(repo, token, model.hub?.revision)
      if (current !== sequence.current) return
      const updated = detail
        ? { ...model, ...service.models().convertHfRepoToCatalogModel(detail) }
        : model
      if (detail) setReviewedModel(updated)
      else setFailed(true)
      if (modelEngine(updated) === 'transformers') {
        const engine = ExtensionManager.getInstance().getEngine(
          'transformers'
        ) as { probe?: () => Promise<unknown> } | undefined
        if (engine?.probe) {
          try {
            const report = (await engine.probe()) as HubRuntime
            if (current === sequence.current && report?.ready)
              setRuntime(report)
          } catch (error) {
            if (current === sequence.current) setRuntimeError(String(error))
          }
        }
      }
    } catch {
      if (current === sequence.current) setFailed(true)
    } finally {
      if (current === sequence.current) setLoading(false)
    }
  }
  const repo = reviewedModel?.hub?.repo ?? reviewedModel?.model_name
  const needsAcknowledgement =
    failed || diagnosis.memory !== 'fits' || diagnosis.engineState !== 'check'
  const reviewDialog = (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value)
        if (!value) {
          ++sequence.current
          setLoading(false)
        }
      }}
    >
      <DialogContent className="max-h-[90svh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{t('hub:catalog.diagnostic')}</DialogTitle>
          <DialogDescription>
            {reviewedModel?.display_name ?? reviewedModel?.model_name}
          </DialogDescription>
        </DialogHeader>
        {reviewedModel && (
          <DiagnosisDetails
            model={reviewedModel}
            variant={variant}
            context={context}
            runtime={runtime}
          />
        )}
        {runtimeError && (
          <p
            role="alert"
            className="break-words text-xs text-amber-600 dark:text-amber-400"
          >
            Python/PyTorch · {runtimeError}
          </p>
        )}
        <label className="flex items-center justify-between gap-3 text-xs">
          {t('hub:catalog.context')}
          <input
            className="w-28 rounded border bg-background p-2"
            type="number"
            min={128}
            max={131072}
            step={128}
            value={context}
            onChange={(event) =>
              setContext(
                Math.max(
                  128,
                  Math.min(131072, Number(event.target.value) || 128)
                )
              )
            }
          />
        </label>
        {loading && (
          <p role="status" className="text-xs">
            {t('hub:catalog.checking')}
          </p>
        )}
        {failed && (
          <p
            role="status"
            className="text-xs text-amber-600 dark:text-amber-400"
          >
            {t('hub:catalog.metadataMissing')}
          </p>
        )}
        {action.current && needsAcknowledgement && diagnosis.canDownload && (
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(event) => setAcknowledged(event.target.checked)}
            />
            {t('hub:catalog.acknowledge')}
          </label>
        )}
        <div className="flex flex-wrap justify-end gap-2">
          {repo && /^[\w.-]+\/[\w.-]+$/.test(repo) && (
            <a
              className="inline-flex items-center text-xs underline mr-auto"
              href={`https://huggingface.co/${repo}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('hub:catalog.source')}
            </a>
          )}
          <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
            {t(action.current ? 'common:cancel' : 'common:close')}
          </Button>
          {action.current && (
            <Button
              size="sm"
              disabled={
                loading ||
                !diagnosis.canDownload ||
                (needsAcknowledgement && !acknowledged)
              }
              onClick={() => {
                const run = action.current
                setOpen(false)
                run?.()
              }}
            >
              {t('hub:download')}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
  return { reviewDownload, reviewDialog }
}

export function HubHardwareDiagnostic({ model }: { model: CatalogModel }) {
  const { t } = useTranslation()
  const diagnosis = useHubDiagnosis(model)
  const { reviewDownload, reviewDialog } = useHubDownloadReview(model)
  return (
    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
      <span className="rounded-full bg-secondary px-2 py-1">
        {t(`hub:catalog.${diagnosis.memory}`)}
      </span>
      <span className="text-muted-foreground">
        {t(`hub:catalog.${diagnosis.engineState}`)}
      </span>
      <button
        className="underline underline-offset-2"
        onClick={() => void reviewDownload()}
      >
        {t('hub:catalog.inspect')}
      </button>
      {diagnosis.nvfp4Advice && (
        <p className="w-full text-muted-foreground">
          {t(`hub:catalog.${diagnosis.nvfp4Advice}`)}
        </p>
      )}
      {reviewDialog}
    </div>
  )
}
