import { describe, expect, it } from 'vitest'
import { joinLocalPath, normalizeLocalPath } from './local-path'

describe('installed local model paths', () => {
  it('repairs saved verbatim Windows paths and joins new installer files correctly', () => {
    const root =
      '\\\\?\\C:\\Users\\User\\Documents\\Novera models\\upscale_models'
    expect(normalizeLocalPath(`${root}/RealESRGAN_x2plus.pth`)).toBe(
      `${root}\\RealESRGAN_x2plus.pth`
    )
    expect(joinLocalPath(root, 'RealESRGAN_x4plus.pth')).toBe(
      `${root}\\RealESRGAN_x4plus.pth`
    )
    expect(joinLocalPath('\\\\?\\UNC\\server\\models', 'model.pth')).toBe(
      '\\\\?\\UNC\\server\\models\\model.pth'
    )
  })
  it('preserves ordinary Windows and POSIX paths', () => {
    expect(joinLocalPath('/home/user/models/', 'model.pth')).toBe(
      '/home/user/models/model.pth'
    )
    expect(normalizeLocalPath('C:/models/model.pth')).toBe(
      'C:/models/model.pth'
    )
    expect(normalizeLocalPath('/home/user/a\\b.pth')).toBe(
      '/home/user/a\\b.pth'
    )
  })
})
