import { useGeneralSetting } from '@/hooks/useGeneralSetting'
import { useAppTranslation } from '@/i18n/hooks'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ChevronsUpDown } from 'lucide-react'

export const NATIVE_LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'ar', label: 'العربية' },
  { value: 'ur', label: 'اردو' },
  { value: 'pcm', label: 'Naijíriá Píjin' },
  { value: 'arz', label: 'مصري' },
  { value: 'mr', label: 'मराठी' },
  { value: 'te', label: 'తెలుగు' },
  { value: 'ta', label: 'தமிழ்' },
  { value: 'sw', label: 'Kiswahili' },
  { value: 'ha', label: 'Hausa' },
  { value: 'pnb', label: 'پنجابی (شاہ مکھی)' },
  { value: 'tl', label: 'Tagalog' },
  { value: 'pt-PT', label: 'Português (Portugal)' },
  { value: 'yue', label: '粵語' },
  { value: 'wuu', label: '吴语（上海话）' },
  { value: 'fa-IR', label: 'فارسی (ایران)' },
  { value: 'am', label: 'አማርኛ' },
  { value: 'th', label: 'ไทย' },
  { value: 'jv', label: 'Basa Jawa' },
  { value: 'gu', label: 'ગુજરાતી' },
  { value: 'kn', label: 'ಕನ್ನಡ' },
  { value: 'apc', label: 'عربي شامي' },
  { value: 'apd', label: 'عربي سوداني' },
  { value: 'yo', label: 'Yorùbá' },
  { value: 'bho', label: 'भोजपुरी' },
  { value: 'cjy', label: '晋语' },
  { value: 'nan', label: '閩南語' },
  { value: 'my', label: 'မြန်မာ' },
  { value: 'arq', label: 'دارجة جزائرية' },
  { value: 'hak', label: '客家話' },
  { value: 'ln', label: 'Lingála' },
  { value: 'ary', label: 'الدارجة المغربية' },
  { value: 'or', label: 'ଓଡ଼ିଆ' },
  { value: 'uk', label: 'Українська' },
  { value: 'hsn', label: '湘语' },
  { value: 'ml', label: 'മലയാളം' },
  { value: 'sd', label: 'سنڌي' },
  { value: 'pa', label: 'ਪੰਜਾਬੀ (ਗੁਰਮੁਖੀ)' },
  { value: 'su', label: 'Basa Sunda' },
  { value: 'ig', label: 'Ìgbò' },
  { value: 'prs', label: 'دری' },
  { value: 'ne', label: 'नेपाली' },
  { value: 'ms', label: 'Bahasa Melayu' },
  { value: 'uzn', label: 'O‘zbekcha (shimoliy)' },
  { value: 'zu', label: 'isiZulu' },
  { value: 'aec', label: 'عربي صعيدي' },
  { value: 'pbu', label: 'پښتو (شمالي)' },
  { value: 'gaz', label: 'Oromoo (Giddugaleessa-Lixaa)' },
  { value: 'skr', label: 'سرائیکی' },
  { value: 'nl', label: 'Nederlands' },
  { value: 'so', label: 'Soomaali' },
  { value: 'ro', label: 'Română' },
  { value: 'as', label: 'অসমীয়া' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'it', label: 'Italiano' },
  { value: 'hi', label: 'हिंदी' },
  { value: 'id', label: 'Bahasa Indonesia' },
  { value: 'pl', label: 'Polski' },
  { value: 'vn', label: 'Tiếng Việt' },
  { value: 'zh-CN', label: '简体中文' },
  { value: 'zh-TW', label: '繁體中文' },
  { value: 'de-DE', label: 'Deutsch' },
  { value: 'cs', label: 'Čeština' },
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'ko', label: '한국어' },
  { value: 'ja', label: '日本語' },
  { value: 'ru', label: 'Русский' },
  { value: 'ca', label: 'Català' },
] satisfies { value: Language; label: string }[]

export default function LanguageSwitcher() {
  const { i18n } = useAppTranslation()
  const { setCurrentLanguage, currentLanguage } = useGeneralSetting()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    setCurrentLanguage(lng as Language)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          <span lang={currentLanguage === 'vn' ? 'vi' : currentLanguage} dir="auto" className="truncate">
          {NATIVE_LANGUAGES.find(
            (lang: { value: string; label: string }) =>
              lang.value === currentLanguage
          )?.label || 'English'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 max-h-80 overflow-y-auto">
        {NATIVE_LANGUAGES.map((lang) => (
          <DropdownMenuItem
            key={lang.value}
            lang={lang.value === 'vn' ? 'vi' : lang.value}
            dir="auto"
            className={cn(
              'cursor-pointer my-0.5',
              currentLanguage === lang.value && 'bg-secondary-foreground/8'
            )}
            onClick={() => changeLanguage(lang.value)}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
