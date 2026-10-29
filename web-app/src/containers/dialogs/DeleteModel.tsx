import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useModelProvider } from '@/hooks/useModelProvider'
import { useServiceHub } from '@/hooks/useServiceHub'

import { IconTrash } from '@tabler/icons-react'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useFavoriteModel } from '@/hooks/useFavoriteModel'

type DialogDeleteModelProps = {
  provider: ModelProvider
  modelId?: string
}

export const DialogDeleteModel = ({
  provider,
  modelId,
}: DialogDeleteModelProps) => {
  const { t } = useTranslation()
  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [open, setOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteFiles, setDeleteFiles] = useState(false)
  const hasRemovalChoices = provider.provider === 'llamacpp'
  const { setProviders, deleteModel: deleteModelCache } = useModelProvider()
  const { removeFavorite } = useFavoriteModel()
  const serviceHub = useServiceHub()

  const removeModel = async () => {
    if (isDeleting || !selectedModelId) return
    setIsDeleting(true)
    try {
      if (hasRemovalChoices) {
        await serviceHub.models().deleteModel(selectedModelId, provider.provider, { deleteFiles })
      } else {
        await serviceHub.models().deleteModel(selectedModelId, provider.provider)
      }
      removeFavorite(selectedModelId, provider.provider)
      deleteModelCache(selectedModelId, provider.provider)
    } catch (error) {
      console.error('Failed to delete model:', error)
      toast.error(t('common:error'), {
        description: error instanceof Error ? error.message : String(error),
      })
      setIsDeleting(false)
      return
    }

    // A catalog refresh failure does not undo a completed disk deletion.
    try {
      const providers = await serviceHub.providers().getProviders()
      setProviders(providers.map((entry) => entry.provider === provider.provider
        ? { ...entry, models: entry.models.filter((model) => model.id !== selectedModelId) }
        : entry))
    } catch (error) {
      console.error('Failed to refresh providers after deletion:', error)
    }
    toast.success(t('providers:deleteModel.title', { modelId: selectedModelId }), {
      id: `delete-model-${selectedModelId}`,
      description: t(hasRemovalChoices && !deleteFiles ? 'providers:deleteModel.removedSuccess' : 'providers:deleteModel.success', { modelId: selectedModelId }),
    })
    setIsDeleting(false)
    setOpen(false)
  }

  // Initialize with the provided model ID or the first model if available
  useEffect(() => {
    if (modelId) {
      setSelectedModelId(modelId)
    } else if (provider.models && provider.models.length > 0) {
      setSelectedModelId(provider.models[0].id)
    }
  }, [provider, modelId])

  // Get the currently selected model
  const selectedModel = provider.models.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (m: any) => m.id === selectedModelId
  )

  if (!selectedModel) {
    return null
  }

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (isDeleting) return
      if (value) setDeleteFiles(false)
      setOpen(value)
    }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <DialogTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              aria-label={t('providers:deleteModel.delete')}
              className="size-6 cursor-pointer flex items-center justify-center rounded transition-all duration-200 ease-in-out hover:bg-main-view-fg/8"
            >
              <IconTrash size={18} className="text-muted-foreground" />
            </div>
          </DialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>{t('providers:deleteModel.delete')}</p>
        </TooltipContent>
      </Tooltip>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('providers:deleteModel.title', { modelId: selectedModel.id })}
          </DialogTitle>
          <DialogDescription>
            {hasRemovalChoices
              ? t('providers:deleteModel.choiceDescription')
              : selectedModel.imported
              ? t('providers:deleteModel.importedDescription')
              : t('providers:deleteModel.description')}
          </DialogDescription>
        </DialogHeader>

        {hasRemovalChoices && (
          <fieldset className="grid gap-3" disabled={isDeleting}>
            <legend className="sr-only">{t('providers:deleteModel.choiceDescription')}</legend>
            {([false, true] as const).map((permanent) => (
              <label key={String(permanent)} className="flex cursor-pointer items-start gap-3 rounded-xl border border-violet-400/30 p-4 has-[:checked]:bg-violet-500/10 has-[:checked]:border-violet-400">
                <input type="radio" name={`remove-model-${selectedModelId}`} className="mt-1 accent-violet-500"
                  checked={deleteFiles === permanent} onChange={() => setDeleteFiles(permanent)} />
                <span>
                  <span className="block font-medium">{t(permanent ? 'providers:deleteModel.permanentlyDelete' : 'providers:deleteModel.removeFromNovera')}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{t(permanent
                    ? selectedModel.imported ? 'providers:deleteModel.permanentImportedDescription' : 'providers:deleteModel.permanentDescription'
                    : 'providers:deleteModel.keepFilesDescription')}</span>
                </span>
              </label>
            ))}
          </fieldset>
        )}
        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button variant="ghost" size="sm" disabled={isDeleting}>
              {t('providers:deleteModel.cancel')}
            </Button>
          </DialogClose>
            <Button variant={hasRemovalChoices && !deleteFiles ? "outline" : "destructive"} size="sm" onClick={removeModel} disabled={isDeleting}>
              {hasRemovalChoices
                ? t(deleteFiles ? 'providers:deleteModel.permanentlyDelete' : 'providers:deleteModel.removeFromNovera')
                : selectedModel.imported
                ? t('providers:deleteModel.removeFromJan')
                : t('providers:deleteModel.delete')}
            </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
