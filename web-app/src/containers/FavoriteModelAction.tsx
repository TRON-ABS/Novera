import { useTranslation as useUiLocale } from '@/i18n/react-i18next-compat'
import { IconStar, IconStarFilled } from '@tabler/icons-react'
import { useFavoriteModel } from '@/hooks/useFavoriteModel'
import { Button } from '@/components/ui/button'

interface FavoriteModelActionProps {
  model: Model
  provider: string
}

export function FavoriteModelAction({ model, provider }: FavoriteModelActionProps) {
  const { t: uiT } = useUiLocale()

  const { isFavorite, toggleFavorite } = useFavoriteModel()
  const isModelFavorite = isFavorite(model.id, provider)

  return (
    <Button
      aria-label={uiT('ui:toggleFavorite')}
      variant="ghost"
      size="icon-xs"
      onClick={() => toggleFavorite(model, provider)}
    >
      {isModelFavorite ? (
        <IconStarFilled size={18} className="text-muted-foreground" />
      ) : (
        <IconStar size={18} className="text-muted-foreground" />
      )}
    </Button>
  )
}
