import { useState } from 'react'
import { useMusicCreation } from '@/hooks/useMusicCreation'
import { useCreation } from '@/hooks/useCreation'
import { MusicSetupPanel } from '@/containers/MusicControls'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { joinLocalPath } from '@/modules/platform/local-path'

/** Registered local music bundles, shown alongside image and text models. */
export function MusicModelLibrary() {
  const { t } = useTranslation()
  const { profiles, select } = useMusicCreation()
  const [open, setOpen] = useState(false)
  const scope = 'settings-music-library'
  const modelPath = (directory: string, name: string) => /^(?:[A-Za-z]:|[/\\])/.test(name) ? name : joinLocalPath(directory, name)
  const configure = (id?: string) => {
    if (id) select(id, scope)
    useCreation.getState().setSelection(scope, 'music')
    setOpen(true)
  }
  return <section aria-label={t('chat:creation.music')} className="min-w-0 rounded-lg border p-3 space-y-3">
    <div className="flex flex-wrap items-start justify-between gap-2">
      <h3 className="min-w-0 text-sm font-medium">{t('chat:creation.music')} · {t('chat:creation.local')}
        <span className="ml-2 rounded-full border px-2 py-0.5 text-xs">{profiles.length}</span>
      </h3>
      <Button size="sm" variant="secondary" className="h-auto max-w-full whitespace-normal break-words" onClick={() => configure()}>{t('chat:creation.settings')}</Button>
    </div>
    <p className="max-w-full break-words text-sm text-muted-foreground">{t('chat:creation.configure')}</p>
    {!profiles.length && <p className="text-sm text-muted-foreground">{t('providers:noInstalledModels')}</p>}
    {profiles.map((profile) => <article key={profile.id} className="min-w-0 rounded-xl border border-violet-400/25 p-3 space-y-2">
      <h4 className="font-medium break-words">{profile.name}</h4>
      <p className="break-all text-xs text-muted-foreground">{profile.settings.directory}</p>
      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        {(['generator', 'planner', 'encoder', 'vae'] as const).map((role) => <div key={role} className="min-w-0">
          <dt className="font-medium">{t(`chat:creation.${{generator: 'musicGenerator', planner: 'musicPlanner', encoder: 'ggufTextEncoder', vae: 'ggufVae'}[role]}`)}</dt>
          <dd className="break-all text-muted-foreground">{profile.settings[role] ? modelPath(profile.settings.directory, profile.settings[role]) : '—'}</dd>
        </div>)}
      </dl>
      <Button size="sm" variant="outline" onClick={() => configure(profile.id)}>{t('common:edit')}</Button>
    </article>)}
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{t('chat:creation.music')} · {t('chat:creation.settings')}</DialogTitle>
          <DialogDescription>{t('chat:creation.autosave')}</DialogDescription>
        </DialogHeader>
        {open && <MusicSetupPanel scope={scope} disabled={false} />}
      </DialogContent>
    </Dialog>
  </section>
}
