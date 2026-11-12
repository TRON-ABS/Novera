// Native WebView2 test, following https://playwright.dev/docs/webview2.
// Runs the installed, signed candidate on disposable ARM64 CI; no IPC mocks.
import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import { spawnSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { compareVersions } from './prepare-version.mjs'
import { checkAutoTune } from './auto-tune-smoke.js'

const feedUrl = 'https://github.com/TRON-ABS/Novera/releases/latest/download/latest.json'
const applicationVersion = JSON.parse(fs.readFileSync(new URL('../../src-tauri/tauri.conf.json', import.meta.url))).version
export function requireWindowsUiHost(platform, architecture, env, autoTune = false) {
  if (platform !== 'win32' || (architecture !== 'arm64' && !(autoTune && architecture === 'x64')) || env.GITHUB_ACTIONS !== 'true' || env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Disposable Windows ARM64 GitHub runner required')
}
export function expectedWindowsUiMessage(feed, currentVersion = applicationVersion) {
  if (typeof feed?.version !== 'string' || !/^\d+\.\d+\.\d+$/.test(feed.version) || compareVersions(feed.version, currentVersion) > 0) throw new Error('This no-update check requires a feed no newer than the current application version')
  const entry = feed.platforms?.['windows-aarch64']
  if (!entry) return { supported: false, text: 'Failed to check for updates' }
  if (typeof entry.url !== 'string' || !new RegExp(`^https://github\\.com/TRON-ABS/Novera/releases/download/v${feed.version.replaceAll('.', '\\.')}(-[a-z0-9.-]+)?/Novera_${feed.version.replaceAll('.', '\\.')}_arm64-setup\\.exe$`).test(entry.url) || !entry.signature) throw new Error('Missing official signed ARM64 feed entry')
  return { supported: true, text: "You're running the latest version" }
}

async function until(operation, timeout = 60_000) {
  const end = Date.now() + timeout
  let last
  while (Date.now() < end) {
    try { const result = await operation(); if (result) return result } catch (error) { last = error }
    await new Promise(resolve => setTimeout(resolve, 250))
  }
  throw new Error(`Native Windows UI condition timed out: ${last?.message ?? 'not observed'}`)
}

async function main(executable) {
  const autoTune = process.argv.includes('--auto-tune')
  requireWindowsUiHost(process.platform, process.arch, process.env, autoTune)
  const base = fs.realpathSync(process.env.RUNNER_TEMP)
  const exe = fs.realpathSync(executable)
  const relative = path.relative(base, exe)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || path.basename(exe) !== 'Novera-Desktop.exe') throw new Error('Use the owned CI installation only')
  const binary = fs.readFileSync(exe)
  const pe = binary.readUInt32LE(60)
  const machine = process.arch === 'arm64' ? 0xaa64 : 0x8664
  if (binary.subarray(0, 2).toString() !== 'MZ' || binary.subarray(pe, pe + 4).toString() !== 'PE\0\0' || binary.readUInt16LE(pe + 4) !== machine) throw new Error('The tested application must match the native runner architecture')
  const response = await fetch(feedUrl)
  if (!response.ok) throw new Error(`Unexpected production feed HTTP ${response.status}`)
  const productionFeed = await response.json()
  const expected = autoTune ? null : expectedWindowsUiMessage(productionFeed)
  const out = path.resolve('.build/validation')
  fs.mkdirSync(out, { recursive: true })
  const scratch = fs.mkdtempSync(path.join(base, 'novera-arm64-ui-'))
  const profile = path.join(scratch, 'profile')
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/TOKEN|PASSWORD|SECRET|PRIVATE_KEY/i.test(key)))
  const locations = { HOME: profile, USERPROFILE: profile, APPDATA: path.join(profile, 'AppData/Roaming'), LOCALAPPDATA: path.join(profile, 'AppData/Local'), TEMP: path.join(scratch, 'tmp'), TMP: path.join(scratch, 'tmp') }
  for (const [name, location] of Object.entries(locations)) { fs.mkdirSync(location, { recursive: true }); env[name] = location }
  for (const name of ['Documents', 'Downloads', 'Desktop']) fs.mkdirSync(path.join(profile, name), { recursive: true })
  env.JAN_DATA_ROOT = locations.APPDATA
  delete env.CI
  const data = path.join(locations.APPDATA, 'Novera/data')
  fs.mkdirSync(data, { recursive: true })
  const settings = { '__settings_migrated_to_backend__': 'true', 'llamacpp-embedder-bootstrapped': 'true', 'llamacpp-qwen3-embedder-bootstrapped': 'true', 'setting-general': JSON.stringify({ state: { currentLanguage: 'en' } }) }
  if (autoTune) {
    // Seed an isolated provider so the chat UI opens after onboarding.
    settings['model-provider'] = JSON.stringify({ version: 22, state: { providers: [{
      provider: 'validation-local',
      base_url: 'http://127.0.0.1:1',
      models: [{ id: 'validation-model', name: 'Validation model' }],
    }] } })
  }
  fs.writeFileSync(path.join(data, 'settings.json'), JSON.stringify(settings))
  const port = await new Promise((resolve, reject) => { const server = net.createServer(); server.once('error', reject); server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)) }) })
  env.WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = `--remote-debugging-port=${port} --remote-debugging-address=127.0.0.1 --lang=en-US`
  env.WEBVIEW2_USER_DATA_FOLDER = path.join(scratch, 'webview-profile')
  const require = createRequire(path.resolve('.build/webview2-driver/package.json'))
  const { chromium } = require('playwright-core')
  const launchReceipt = path.join(scratch, 'launch.json')
  const launchLog = path.join(out, 'WINDOWS-UPDATER-UI.launch.log')
  const launchFd = fs.openSync(launchLog, 'w')
  const launched = spawnSync('powershell.exe', ['-NoProfile', '-File', path.resolve('scripts/distribution/launch-ci-standard-user.ps1'), '-Executable', exe, '-Receipt', launchReceipt, '-LogFile', path.join(out, 'WINDOWS-UPDATER-UI.log')], { env, windowsHide: true, stdio: ['ignore', launchFd, launchFd], timeout: 60_000 })
  fs.closeSync(launchFd)
  if (launched.status !== 0) {
    if (fs.existsSync(launchReceipt)) { const started = JSON.parse(fs.readFileSync(launchReceipt)); if (started.pid) spawnSync('taskkill', ['/PID', String(started.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }) }
    throw new Error(`Standard-user UI launch failed (${launched.error?.code ?? launched.status}): ${fs.readFileSync(launchLog, 'utf8').slice(-8000)}`)
  }
  const processHandle = JSON.parse(fs.readFileSync(launchReceipt, 'utf8'))
  if (processHandle.integrityRid !== 8192 || processHandle.elevated !== false) throw new Error('The actual UI process must be non-elevated at medium integrity')
  let browser, page
  const receipt = { platform: process.arch === 'arm64' ? 'windows-aarch64' : 'windows-x86_64', sourceCommit: process.env.GITHUB_SHA, checkedAt: new Date().toISOString(), executableSha256: createHash('sha256').update(binary).digest('hex'), nativeArchitecture: process.arch, processIntegrity: processHandle, feed: feedUrl, feedPlatformPresent: expected?.supported, nativeUiCheckPassed: false, productionManualCheckValidated: false, updateInstalled: false, limitations: ['Direct Settings route in a fresh isolated profile; onboarding and model setup are not covered', 'No offered update or transition between two public versions is installed'] }
  Object.assign(receipt, { applicationVersion, productionFeedVersion: productionFeed.version, feedMatchesApplicationVersion: productionFeed.version === applicationVersion })
  try {
    await until(async () => { const r = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(2_000) }); return r.ok })
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
    page = await until(() => browser.contexts().flatMap(context => context.pages()).find(p => p.url().startsWith('http://tauri.localhost') || p.url().startsWith('tauri://localhost')))
    const origin = await page.evaluate(() => location.origin)
    if (autoTune) {
      await page.goto(origin + '/')
      receipt.autoTune = await page.evaluate(checkAutoTune)
      await page.screenshot({ path: path.join(out, 'WINDOWS-AUTO-TUNE.png'), fullPage: true })
      return
    }
    await page.goto(origin + '/settings/general')
    const button = page.getByRole('button', { name: /^check for updates$/i })
    await button.waitFor({ state: 'visible', timeout: 60_000 })
    if (!(await page.locator('body').innerText()).includes(applicationVersion)) throw new Error('Expected the real application version in Settings')
    await button.click()
    await page.getByText(expected.text, { exact: true }).waitFor({ state: 'visible', timeout: 45_000 })
    const text = await page.locator('body').innerText()
    const opposite = expected.supported ? 'Failed to check for updates' : "You're running the latest version"
    if (text.includes(opposite)) throw new Error('UI disagrees with the actual production feed')
    if (!(await button.isEnabled())) throw new Error('Manual check button did not become available again')
    await page.screenshot({ path: path.join(out, 'WINDOWS-UPDATER-UI.png'), fullPage: true })
    Object.assign(receipt, { nativeUiCheckPassed: true, productionManualCheckValidated: expected.supported, observedMessage: expected.text, visibleText: text, settingsOrigin: origin })
  } catch (error) {
    receipt.error = error.message
    if (page) { receipt.visibleTextAtFailure = await page.locator('body').innerText().catch(() => ''); await page.screenshot({ path: path.join(out, 'WINDOWS-UPDATER-UI.png'), fullPage: true }).catch(() => {}) }
    throw error
  } finally {
    fs.writeFileSync(path.join(out, autoTune ? 'WINDOWS-AUTO-TUNE.json' : 'WINDOWS-UPDATER-UI.json'), JSON.stringify(receipt, null, 2) + '\n')
    await browser?.close().catch(() => {})
    if (processHandle.pid) spawnSync('taskkill', ['/PID', String(processHandle.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
  }
  console.log(JSON.stringify(receipt, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv[2])
