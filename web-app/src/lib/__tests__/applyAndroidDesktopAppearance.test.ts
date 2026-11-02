import { beforeEach, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({ android: true, version: undefined as number | undefined,
  setTheme: vi.fn(), setAccent: vi.fn(), setState: vi.fn() }))
vi.mock('@/lib/platform/utils', () => ({ isPlatformAndroid: () => h.android }))
vi.mock('@/hooks/useTheme', () => ({ useTheme: {
  getState: () => ({ androidDesktopAppearanceVersion: h.version, setTheme: h.setTheme }),
  setState: h.setState,
} }))
vi.mock('@/hooks/useInterfaceSettings', () => ({ useInterfaceSettings: {
  getState: () => ({ setAccentColor: h.setAccent }),
} }))
import { applyAndroidDesktopAppearance } from '../applyAndroidDesktopAppearance'

beforeEach(() => {
  vi.clearAllMocks()
  h.android = true
  h.version = undefined
  h.setTheme.mockResolvedValue(undefined)
  h.setState.mockImplementation(value => { h.version = value.androidDesktopAppearanceVersion })
})

it('applies the observed Desktop appearance once, allowing subsequent user choices to survive restart', async () => {
  await applyAndroidDesktopAppearance()
  expect(h.setTheme).toHaveBeenCalledWith('dark')
  expect(h.setAccent).toHaveBeenCalledWith('gray')
  await applyAndroidDesktopAppearance()
  expect(h.setTheme).toHaveBeenCalledTimes(1)
  expect(h.setAccent).toHaveBeenCalledTimes(1)
})

it('does not change Desktop or iOS preferences', async () => {
  h.android = false
  await applyAndroidDesktopAppearance()
  expect(h.setTheme).not.toHaveBeenCalled()
  expect(h.setState).not.toHaveBeenCalled()
  expect(h.setAccent).not.toHaveBeenCalled()
})

it('keeps startup available when native theme notification fails', async () => {
  h.setTheme.mockRejectedValueOnce(new Error('native theme notification unavailable'))
  await expect(applyAndroidDesktopAppearance()).resolves.toBeUndefined()
  expect(h.setAccent).toHaveBeenCalledWith('gray')
  expect(h.version).toBe(1)
})
