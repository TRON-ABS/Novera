import { isPlatformAndroid } from '@/lib/platform/utils'
import { useTheme } from '@/hooks/useTheme'
import { useInterfaceSettings } from '@/hooks/useInterfaceSettings'

/** Apply the requested Desktop appearance once, after existing settings hydrate. */
export async function applyAndroidDesktopAppearance() {
  if (!isPlatformAndroid() || useTheme.getState().androidDesktopAppearanceVersion === 1) return
  try {
    // Shared dark CSS supplies Desktop's navy composer and cyan outlines.
    await useTheme.getState().setTheme('dark')
  } catch (error) {
    // setTheme commits the persisted preference before notifying the native UI.
    // A native notification failure must not prevent the app from starting.
    console.warn('Android native theme notification failed:', error)
  }
  useInterfaceSettings.getState().setAccentColor('gray')
  useTheme.setState({ androidDesktopAppearanceVersion: 1 })
}
