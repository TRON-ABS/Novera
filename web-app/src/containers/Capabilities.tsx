import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  IconEye,
  IconTool,
  IconAtom,
  IconWorld,
  IconCodeCircle2,
  IconHeadphones,
  IconPhoto,
  IconVideo,
} from '@tabler/icons-react'
import { Fragment, memo } from 'react'
import { useTranslation } from '@/i18n/react-i18next-compat'

interface CapabilitiesProps {
  capabilities: string[]
}

const Capabilities = memo(function Capabilities({
  capabilities,
}: CapabilitiesProps) {
  const { t } = useTranslation()
  if (!capabilities.length) return null

  // Filter out proactive capability as it's now managed in MCP settings
  const filteredCapabilities = capabilities.filter((capability) => {
    return capability !== 'proactive'
  })

  return (
    <div className="flex gap-0.5">
      {filteredCapabilities.map((capability: string, capIndex: number) => {
        let icon = null

        // Embedding models get special treatment with a distinct visual style
        const isEmbedding = capability === 'embeddings'

        if (capability === 'image-generation') {
          icon = <IconPhoto className="size-4" />
        } else if (capability === 'video-generation') {
          icon = <IconVideo className="size-4" />
        } else if (capability === 'vision' || capability === 'image-input') {
          icon = <IconEye className="size-4" />
        } else if (capability === 'audio') {
          icon = <IconHeadphones className="size-3.5" />
        } else if (capability === 'tools') {
          icon = <IconTool className="size-3.5" />
        } else if (capability === 'reasoning') {
          icon = <IconAtom className="size-3.5" />
        } else if (capability === 'embeddings' || isEmbedding) {
          icon = <IconCodeCircle2 className="size-3.5" />
        } else if (capability === 'web_search') {
          icon = <IconWorld className="size-3.5" />
        } else {
          icon = null
        }

        return (
          <Fragment key={`capability-${capIndex}`}>
            {icon && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="flex items-center gap-1 size-5 hover:bg-secondary rounded text-muted-foreground justify-center last:mr-1 transition-all">
                      {icon}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t(`chat:creation.capabilities.${capability}`)}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </Fragment>
        )
      })}
    </div>
  )
})

export default Capabilities
