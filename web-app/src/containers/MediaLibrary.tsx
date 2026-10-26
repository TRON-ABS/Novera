import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useTranslation } from '@/i18n/react-i18next-compat'
import { useServiceHub } from '@/hooks/useServiceHub'
import { creationDefaults } from '@/hooks/useCreation'
import {
  useMediaLibrary,
  selectMediaProfile,
  validateMediaProfile,
  type MediaProfile,
} from '@/hooks/useMediaLibrary'

/** Shares the existing llama import page, while media stays out of the text engine. */
export function MediaLibrary() {
  const { t } = useTranslation()
  const service = useServiceHub()
  const { profiles, put, remove } = useMediaLibrary()
  const [editing, setEditing] = useState<MediaProfile>()
  const [deleting, setDeleting] = useState<MediaProfile>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)
  const component =
    editing?.task === 'image' && editing.settings.imageEngine !== 'diffusers'
  const fields = component
    ? (['ggufImageModel', 'ggufTextEncoder', 'ggufVae'] as const)
    : ([editing?.task === 'video' ? 'videoModel' : 'imageModel'] as const)
  return (
    <section className="space-y-4">
      {(['image', 'video'] as const).map((task) => (
        <section
          key={task}
          aria-label={t(`chat:creation.${task}`)}
          className="rounded-lg border p-3 space-y-3"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium">
              {t(`chat:creation.${task}`)} · {t('chat:creation.local')}
            </h2>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setError(false)
                setEditing({
                  id: `media-${crypto.randomUUID()}`,
                  name: '',
                  task,
                  settings: {
                    ...creationDefaults,
                    imageEngine: task === 'image' ? 'sdcpp' : 'diffusers',
                    encoderDevice: 'cpu',
                    steps: task === 'image' ? 4 : 20,
                  },
                })
              }}
            >
              {t('providers:import')}
            </Button>
          </div>
          {profiles
            .filter((p) => p.task === task)
            .map((profile) => (
              <div key={profile.id} className="rounded border p-3 space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <p className="text-sm font-medium break-words">
                    {profile.name}
                  </p>
                  <span
                    className="text-xs text-muted-foreground"
                    title={t('providers:importedTooltip')}
                  >
                    {t('providers:imported')}
                  </span>
                </div>
                <p className="break-all text-xs text-muted-foreground">
                  {task === 'video'
                    ? profile.settings.videoModel
                    : profile.settings.imageEngine === 'diffusers'
                      ? profile.settings.imageModel
                      : profile.settings.ggufImageModel}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      selectMediaProfile(profile)
                      window.dispatchEvent(
                        new CustomEvent('novera-creation-settings', {
                          detail: {
                            installed: true,
                            profileId: profile.id,
                            task: profile.task,
                          },
                        })
                      )
                    }}
                  >
                    {t('chat:creationInstall.use')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setError(false)
                      setEditing(structuredClone(profile))
                    }}
                  >
                    {t('common:edit')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleting(profile)}
                  >
                    {t('common:delete')}
                  </Button>
                </div>
              </div>
            ))}
        </section>
      ))}
      <Dialog
        open={!!editing}
        onOpenChange={(open) => {
          if (!open && !busy) setEditing(undefined)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t('providers:import')} ·{' '}
              {t(`chat:creation.${editing?.task ?? 'image'}`)}
            </DialogTitle>
            <DialogDescription>
              {t('providers:importedTooltip')}
            </DialogDescription>
          </DialogHeader>
          {editing && (
            <>
              <label className="text-sm">
                {t('common:name')}
                <input
                  className="block w-full border rounded p-2"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                />
              </label>
              {editing.task === 'image' && (
                <label className="text-sm">
                  {t('chat:creation.imageEngine')}
                  <select
                    className="block w-full border rounded p-2"
                    value={editing.settings.imageEngine}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        settings: {
                          ...editing.settings,
                          imageEngine: e.target
                            .value as MediaProfile['settings']['imageEngine'],
                        },
                      })
                    }
                  >
                    <option value="sdcpp">
                      stable-diffusion.cpp · GGUF / Safetensors
                    </option>
                    <option value="diffusers">Diffusers</option>
                    <option value="nvfp4-cuda">NVFP4 CUDA · PyTorch</option>
                  </select>
                </label>
              )}
              {fields.map((field) => (
                <label className="text-sm space-y-1" key={field}>
                  {t(`chat:creation.${field}`)}
                  <div className="flex gap-2">
                    <input
                      className="block min-w-0 flex-1 border rounded p-2 text-xs"
                      value={editing.settings[field] ?? ''}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          settings: {
                            ...editing.settings,
                            [field]: e.target.value,
                          },
                        })
                      }
                    />
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const directory =
                          field === 'imageModel' || field === 'videoModel'
                        const path = await service.dialog().open({
                          directory,
                          multiple: false,
                          ...(!directory
                            ? {
                                filters: [
                                  {
                                    name: t(`chat:creation.${field}`),
                                    extensions: ['gguf', 'safetensors'],
                                  },
                                ],
                              }
                            : {}),
                        })
                        if (typeof path === 'string')
                          setEditing({
                            ...editing,
                            settings: { ...editing.settings, [field]: path },
                          })
                      }}
                    >
                      {t('common:browse')}
                    </Button>
                  </div>
                </label>
              ))}
              {(
                [
                  'device',
                  ...(component ? (['encoderDevice'] as const) : []),
                ] as const
              ).map((field) => (
                <label key={field} className="text-sm">
                  {t(`chat:creation.${field}`)}
                  <select
                    className="block w-full border rounded p-2"
                    value={editing.settings[field]}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        settings: {
                          ...editing.settings,
                          [field]: e.target.value,
                        },
                      })
                    }
                  >
                    <option value="auto">{t('chat:creation.auto')}</option>
                    <option value="cpu">CPU</option>
                    <option value="cuda">CUDA</option>
                  </select>
                </label>
              ))}
              {error && (
                <p role="alert" className="text-xs">
                  {t('chat:creationInstall.error')}
                </p>
              )}
              <Button
                disabled={busy || !editing.name.trim()}
                onClick={async () => {
                  setBusy(true)
                  setError(false)
                  try {
                    await validateMediaProfile(editing)
                    put({ ...editing, name: editing.name.trim() })
                    setEditing(undefined)
                  } catch {
                    setError(true)
                  } finally {
                    setBusy(false)
                  }
                }}
              >
                {t('common:save')}
              </Button>
              <Button
                variant="ghost"
                disabled={busy}
                onClick={() => setEditing(undefined)}
              >
                {t('common:cancel')}
              </Button>
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={!!deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(undefined)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('providers:deleteModel.title', { modelId: deleting?.name })}
            </DialogTitle>
            <DialogDescription>
              {t('providers:deleteModel.importedDescription')}
            </DialogDescription>
          </DialogHeader>
          <Button
            onClick={() => {
              if (deleting) remove(deleting.id)
              setDeleting(undefined)
            }}
          >
            {t('providers:deleteModel.removeFromJan')}
          </Button>
          <Button variant="ghost" onClick={() => setDeleting(undefined)}>
            {t('common:cancel')}
          </Button>
        </DialogContent>
      </Dialog>
    </section>
  )
}
