import { useHardware } from '@/hooks/useHardware'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { nvfp4Hardware } from '@/modules/engines/hub-catalog'

export const LFM3_NVFP4_URL = 'https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4/resolve/main/model.safetensors?download=true'

/** Offer the source weights only on compatible hardware; GGUF conversion is still required. */
export function Nvfp4TextRecommendation() {
  const { t } = useTranslation()
  const eligible = useHardware((s) => s.hardwareData.gpus.some((gpu) =>
    gpu.activated !== false && nvfp4Hardware({
      name: gpu.name, vendor: gpu.vendor,
      computeCapability: gpu.nvidia_info?.compute_capability,
      totalBytes: gpu.total_memory * 1024 ** 2,
    })
  ))
  if (!eligible) return null
  return <div className="rounded-lg border p-3 space-y-3">
    <h3 className="text-sm font-medium">LFM3-1.7B · NVFP4 · 1.83 GB · Safetensors</h3>
    <p className="text-xs text-muted-foreground">{t('chat:creation.setupTextNvfp4Note')}</p>
    <div className="flex flex-wrap items-center gap-3">
      <a className="text-sm underline" href={LFM3_NVFP4_URL} target="_blank" rel="noopener noreferrer">{t('hub:download')}</a>
      <a className="text-sm underline" href="https://huggingface.co/LiquidAI/LFM3-1.7B-NVFP4" target="_blank" rel="noopener noreferrer">{t('hub:catalog.source')}</a>
    </div>
  </div>
}
