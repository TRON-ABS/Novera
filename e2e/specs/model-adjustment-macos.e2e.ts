import { mkdirSync, writeFileSync } from 'node:fs'
import { $, browser, expect } from '@wdio/globals'
import { clickWhenReady } from '../helpers/interactions.js'
import { startMockOpenAI } from '../helpers/mock-openai.js'
import { goto } from '../helpers/navigation.js'
import { configureMockProvider, denyAnalyticsConsent } from '../helpers/provider.js'

const dialog = '[data-testid="model-adjustment-dialog"]'
const settings = '.novera-settings-window'
const evidence = 'logs/macos-model-adjustment'

describe('Novera macOS ARM64 native model adjustment', () => {
  const mock = startMockOpenAI()
  before(async () => {
    mkdirSync(evidence, { recursive: true })
    await $('#root').waitForExist({ timeout: 60_000 })
    await configureMockProvider(await mock, 'macos-validation')
    await goto('/')
    await denyAnalyticsConsent({ required: false })
  })
  after(async () => { await (await mock).close() })

  it('keeps the llama.cpp provider page open while the dashboard rerenders', async () => {
    await clickWhenReady('[data-testid="composer-nav-settings"]')
    const engine = `${settings} [data-settings-provider="llamacpp"]`
    if (!(await $(engine).isExisting())) {
      await clickWhenReady(`${settings} [data-testid="settings-hidden-providers"]`)
    }
    await clickWhenReady(engine)
    const engineInfo = `${settings} a[href$="/releases/tag/v1.0.0"]`
    await $(engineInfo).waitForDisplayed({ timeout: 30_000 })
    // Opening a second dashboard panel changes the parent that owns Settings.
    await clickWhenReady('[data-testid="model-adjustment-trigger"]')
    await $(dialog).waitForExist()
    await expect($(engineInfo)).toBeExisting()
    await clickWhenReady(`${dialog} [data-slot="dialog-close"]`)
    await expect($(engineInfo)).toBeDisplayed()
    await browser.saveScreenshot(`${evidence}/llama-cpp-settings.png`)
    await clickWhenReady(`${settings} [data-slot="dialog-close"]`)
  })

  it('displays the original and recalibrated KL on all five corpora', async () => {
    await clickWhenReady('[data-testid="model-adjustment-trigger"]')
    await expect($(dialog)).toHaveText(expect.stringContaining('LFM3 Omni 2B Q8'))
    await expect($(dialog)).toHaveText(expect.stringContaining('LFM3 Omni 2B Q4'))
    await clickWhenReady(`${dialog} [data-testid="model-adjustment-start"]`)
    await browser.waitUntil(async () => {
      const error = await $(`${dialog} [role="alert"]`)
      if (await error.isExisting()) throw new Error(await error.getText())
      const cells = await browser.execute((selector: string) =>
        Array.from(document.querySelectorAll(`${selector} tbody tr`)).map(row =>
          Array.from(row.querySelectorAll('td:nth-child(5) > span.block:not(.text-xs)')).length
        ), dialog)
      return cells.length === 2 && cells.every(count => count === 5)
    }, { timeout: 1_200_000, interval: 2000, timeoutMsg: 'Expected five displayed corpus results for both Q4 variants' })
    const report = await $(`${dialog} table`).getText()
    writeFileSync(`${evidence}/results.txt`, report)
    console.log(report)
    await browser.saveScreenshot(`${evidence}/five-corpora.png`)
  })
})
