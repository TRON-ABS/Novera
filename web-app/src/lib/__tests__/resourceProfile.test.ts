import { describe, expect, it } from 'vitest'
import { resourceProfile } from '../resourceProfile'
import { LIGHT_OMNI_MODEL, LIGHT_TEXT_MODEL, noveraRecommendedModelFor } from '../noveraRecommendedModel'
import { modelEngine } from '@/modules/engines/hub-catalog'
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'

const desktop = { platform: 'windows', ramMiB: 32768, availableMiB: 20000, gpuMiB: 8192 }
describe('automatic resource configuration', () => {
  it('retains the complete Windows pack on a capable desktop', () => {
    expect(resourceProfile(desktop)).toMatchObject({ light: false, fullPack: true, context: 16384,
      local: { image: true, music: true, video: true } })
  })
  it('recognizes a nominal 16 GiB desktop with hardware-reserved RAM without inflating free memory', () => {
    expect(resourceProfile({ ...desktop, ramMiB: 15789, gpuMiB: 8151, availableMiB: 8000 }))
      .toMatchObject({ light: false, local: { image: true, music: true, video: true }, fullPack: false })
    expect(resourceProfile({ ...desktop, ramMiB: 15789, availableMiB: 10239 }).fullPack).toBe(false)
    expect(resourceProfile({ ...desktop, ramMiB: 15789, availableMiB: 10240 }).fullPack).toBe(true)
    expect(resourceProfile({ ...desktop, ramMiB: 15360 }).local.music).toBe(false)
  })
  it.each(['windows', 'linux', 'macos', 'android', 'ios'])('uses a light text fallback on a small %s device', platform => {
    expect(resourceProfile({ ...desktop, platform, ramMiB: 4096, availableMiB: 2800, gpuMiB: 0 }))
      .toMatchObject({ light: true, omni: false, textFits: true, context: 2048, fullPack: false,
        local: { image: false, music: false, video: false } })
  })
  it('requires both free memory and an identifiable new engine for Omni', () => {
    const mobile = { ...desktop, platform: 'android', ramMiB: 8192, availableMiB: 4096 }
    for (const engineBuild of [undefined, '11940', 'broken', '11960beta'])
      expect(resourceProfile({ ...mobile, engineBuild }).omni).toBe(false)
    expect(resourceProfile({ ...mobile, engineBuild: '11960' })).toMatchObject({ omni: true, fullPack: false,
      local: { image: false, music: false, video: false } })
    expect(resourceProfile({ ...mobile, engineBuild: '11960', availableMiB: 4095 }).omni).toBe(false)
  })
  it('does not infer free RAM or Omni compatibility from total memory', () => {
    expect(resourceProfile({ ...desktop, platform: 'ios', availableMiB: undefined, engineBuild: '11960' }))
      .toMatchObject({ omni: false, textFits: false })
    expect(resourceProfile({ ...desktop, ramMiB: 0 })).toMatchObject({ known: false, light: true, fullPack: false, omni: false })
  })
  it('treats unified memory explicitly and never offers the Windows pack on macOS', () => {
    expect(resourceProfile({ ...desktop, platform: 'macos', unified: true, gpuMiB: 0 }))
      .toMatchObject({ light: false, fullPack: false, local: { image: true, music: false, video: true } })
  })
  it('pins the light downloads and includes the matching Omni projector', () => {
    expect(noveraRecommendedModelFor(true)).toEqual(LIGHT_TEXT_MODEL)
    for (const model of [LIGHT_TEXT_MODEL, LIGHT_OMNI_MODEL]) {
      expect(model.quants).toHaveLength(1)
      expect(model.quants![0].path).toContain(`/resolve/${model.revision}/`)
    }
    expect(LIGHT_OMNI_MODEL.mmproj_models).toHaveLength(1)
    expect(LIGHT_OMNI_MODEL.mmproj_models![0].path).toContain(`/resolve/${LIGHT_OMNI_MODEL.revision}/`)
    expect(LIGHT_TEXT_MODEL.mmproj_models).toBeUndefined()
  })
  it('recognizes publisher Omni metadata without allowing arbitrary any-to-any GGUFs', () => {
    const omni = { ...LIGHT_OMNI_MODEL, model_name: 'LiquidAI/LFM3-Omni-2B-GGUF', pipeline_tag: 'any-to-any' }
    expect(modelEngine(omni)).toBe('llamacpp')
    expect(modelEngine({ ...omni, model_name: 'other/any-model' })).toBe('future')
  })
  it('has every reused configuration message in all 80 locale catalogs', () => {
    const directory = resolve(__dirname, '../../locales')
    const locales = readdirSync(directory, { withFileTypes: true }).filter(entry => entry.isDirectory() && entry.name !== '__tests__')
    expect(locales).toHaveLength(80)
    const keys = {
      hub: ['catalog.advisorNote', 'catalog.reasonSmall', 'catalog.tipLimited', 'catalog.context', 'catalog.hardwareUnknown', 'catalog.engine', 'catalog.check'],
      chat: ['creation.auto', 'creation.text', 'creation.local', 'creation.cloudNote', 'creationInstall.error'],
      common: ['editModel.notAvailable'],
    }
    for (const locale of locales) for (const [namespace, paths] of Object.entries(keys)) {
      const catalog = JSON.parse(readFileSync(`${directory}/${locale.name}/${namespace}.json`, 'utf8'))
      for (const path of paths) {
        const value = path.split('.').reduce((node, key) => node?.[key], catalog)
        expect(typeof value === 'string' && value.trim().length > 0, `${locale.name}:${namespace}:${path}`).toBe(true)
      }
    }
  })
})
