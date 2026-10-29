import { useState } from 'react'
import { NotebookPen, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { useNoveraInstructions, getNoveraInstructions, getDefaultNoveraInstructions, type InstructionCategory } from '@/hooks/useNoveraInstructions'
import { useTranslation } from '@/i18n/react-i18next-compat'

export function NoveraInstructionsButton() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(getNoveraInstructions)
  const title = `Novera · ${t('common:projects.manageInstructions')}`
  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon-sm" className="composer-action composer-instructions" aria-label={title}
            onClick={() => { setDraft(getNoveraInstructions()); setOpen(true) }}>
            <NotebookPen aria-hidden="true" size={16} />
          </Button>
        </TooltipTrigger>
        <TooltipContent>{title}</TooltipContent>
      </Tooltip>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{t('assistants:officialInstructions', { path: title })}</DialogDescription>
          </DialogHeader>
          {(['text', 'image', 'video'] as InstructionCategory[]).map((category) => (
            <label key={category} className="grid gap-2 text-sm font-medium">
              {t(`chat:creation.${category}`)}
              <textarea className="min-h-24 w-full resize-y rounded-xl border bg-background p-3 text-sm font-normal outline-none focus-visible:ring-2 focus-visible:ring-violet-400"
                value={draft[category]} onChange={(event) => setDraft({ ...draft, [category]: event.target.value })} />
            </label>
          ))}
          <div className="flex justify-end gap-2">
            <Button size="xs" variant="ghost" className="mr-auto" onClick={() => setDraft(getDefaultNoveraInstructions())}>
              <RotateCcw size={12} aria-hidden="true" />{t('common:reset')}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>{t('common:cancel')}</Button>
            <Button onClick={() => { useNoveraInstructions.getState().setInstructions(draft); setOpen(false) }}>{t('common:save')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
