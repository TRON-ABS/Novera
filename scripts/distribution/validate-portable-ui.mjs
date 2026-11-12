// Native WebView2 test, following https://playwright.dev/docs/webview2.
// Runs the native portable candidate on disposable x64 CI; no IPC mocks.
import fs from 'node:fs'
import path from 'node:path'
import net from 'node:net'
import { spawnSync, execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { compareVersions } from './prepare-version.mjs'
import { checkAutoTune } from './auto-tune-smoke.js'

const feedUrl = 'https://github.com/TRON-ABS/Novera/releases/latest/download/latest-portable.json'
const applicationVersion = JSON.parse(fs.readFileSync(new URL('../../src-tauri/tauri.conf.json', import.meta.url))).version
function requireWindowsUiHost(platform, architecture, env) {
  if (platform !== 'win32' || architecture !== 'x64' || env.GITHUB_ACTIONS !== 'true' || env.RUNNER_ENVIRONMENT !== 'github-hosted') throw new Error('Disposable Windows x64 GitHub runner required')
}
function expectedWindowsUiMessage(feed) {
  const entry = feed?.platforms?.['windows-x86_64']
  if (!entry) return { supported: false, text: 'Failed to check for updates' }
  if (compareVersions(feed.version, applicationVersion) > 0 || entry.url !== `https://github.com/TRON-ABS/Novera/releases/download/v${feed.version}-windows-portable/Novera_${feed.version}_x64-portable-update.exe` || !entry.signature) throw new Error('Unexpected portable production feed')
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
  const phase = process.argv[3]
  if (!['initial', 'moved', 'updated', 'post'].includes(phase)) throw new Error('Expected a portable validation phase')
  const portableRoot = path.dirname(path.dirname(fs.realpathSync(executable)))
  if (path.basename(path.dirname(executable)) !== 'Program' || JSON.parse(fs.readFileSync(path.join(portableRoot, 'novera-portable.json'))).format !== 'novera-windows-portable') throw new Error('Marked portable runtime required')

  requireWindowsUiHost(process.platform, process.arch, process.env)
  const base = fs.realpathSync(process.env.RUNNER_TEMP)
  const exe = fs.realpathSync(executable)
  const relative = path.relative(base, exe)
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative) || path.basename(exe) !== 'Novera-Desktop.exe') throw new Error('Use the owned CI installation only')
  const binary = fs.readFileSync(exe)
  const pe = binary.readUInt32LE(60)
  if (binary.subarray(0, 2).toString() !== 'MZ' || binary.subarray(pe, pe + 4).toString() !== 'PE\0\0' || binary.readUInt16LE(pe + 4) !== 0x8664) throw new Error('The tested application must be a native x64 PE')
  const response = await fetch(feedUrl)
  if (!response.ok && response.status !== 404) throw new Error(`Unexpected production feed HTTP ${response.status}`)
  const expected = expectedWindowsUiMessage(response.ok ? await response.json() : null)
  const out = path.resolve('.build/validation')
  fs.mkdirSync(out, { recursive: true })
  const scratch = fs.mkdtempSync(path.join(base, 'novera-portable-ui-'))
  const profile = path.join(scratch, 'profile')
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !/TOKEN|PASSWORD|SECRET|PRIVATE_KEY|API_KEY|ACCESS_KEY|CREDENTIAL|AUTHORIZATION/i.test(key)))
  const locations = { HOME: profile, USERPROFILE: profile, APPDATA: path.join(profile, 'AppData/Roaming'), LOCALAPPDATA: path.join(profile, 'AppData/Local'), TEMP: path.join(scratch, 'tmp'), TMP: path.join(scratch, 'tmp') }
  for (const [name, location] of Object.entries(locations)) { fs.mkdirSync(location, { recursive: true }); env[name] = location }
  for (const name of ['Documents', 'Downloads', 'Desktop']) fs.mkdirSync(path.join(profile, name), { recursive: true })
  env.JAN_DATA_ROOT = locations.APPDATA
  delete env.CI
  env.NOVERA_VALIDATE_PORTABLE = 'true'
  const data = path.join(portableRoot, 'Data/Novera/data')
  fs.mkdirSync(data, { recursive: true })
  if (!fs.existsSync(path.join(data, 'settings.json'))) fs.writeFileSync(path.join(data, 'settings.json'), JSON.stringify({ '__settings_migrated_to_backend__': 'true', 'llamacpp-embedder-bootstrapped': 'true', 'llamacpp-qwen3-embedder-bootstrapped': 'true', 'setting-general': JSON.stringify({ state: { currentLanguage: 'en' } }), 'model-provider': JSON.stringify({ version: 22, state: { providers: [{ provider: 'validation-local', base_url: 'http://127.0.0.1:1', models: [{ id: 'validation-model', name: 'Validation model' }] }] } }) }))
  const port = await new Promise((resolve, reject) => { const server = net.createServer(); server.once('error', reject); server.listen(0, '127.0.0.1', () => { const port = server.address().port; server.close(() => resolve(port)) }) })
  env.WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS = `--remote-debugging-port=${port} --remote-debugging-address=127.0.0.1 --lang=en-US`
  env.WEBVIEW2_USER_DATA_FOLDER = path.join(scratch, 'webview-profile')
  const require = createRequire(path.resolve('.build/webview2-driver/package.json'))
  const { chromium } = require('playwright-core')
  const launchReceipt = path.join(scratch, 'launch.json')
  const launchLog = path.join(out, 'PORTABLE-UI-'+phase+'.launch.log')
  const launchFd = fs.openSync(launchLog, 'w')
  const launched = spawnSync('powershell.exe', ['-NoProfile', '-File', path.resolve('scripts/distribution/launch-ci-standard-user.ps1'), '-Executable', exe, '-Receipt', launchReceipt, '-LogFile', path.join(out, 'PORTABLE-UI-'+phase+'.log')], { env, windowsHide: true, stdio: ['ignore', launchFd, launchFd], timeout: 60_000 })
  fs.closeSync(launchFd)
  if (launched.status !== 0) {
    if (fs.existsSync(launchReceipt)) { const started = JSON.parse(fs.readFileSync(launchReceipt)); if (started.pid) spawnSync('taskkill', ['/PID', String(started.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' }) }
    throw new Error(`Standard-user UI launch failed (${launched.error?.code ?? launched.status}): ${fs.readFileSync(launchLog, 'utf8').slice(-8000)}`)
  }
  const processHandle = JSON.parse(fs.readFileSync(launchReceipt, 'utf8'))
  if (processHandle.integrityRid !== 8192 || processHandle.elevated !== false) throw new Error('The actual UI process must be non-elevated at medium integrity')
  let browser, page
  const receipt = { platform: 'windows-x86_64', sourceCommit: process.env.GITHUB_SHA, phase, portableRoot, checkedAt: new Date().toISOString(), executableSha256: createHash('sha256').update(binary).digest('hex'), nativeArchitecture: 'x64', processIntegrity: processHandle, feed: feedUrl, feedPlatformPresent: expected.supported, nativeUiCheckPassed: false, productionManualCheckValidated: false, updateInstalled: false, limitations: ['Direct Settings route in a fresh isolated profile; onboarding and model setup are not covered', 'No offered update or transition between two public versions is installed'] }
  try {
    await until(async () => { const r = await fetch(`http://127.0.0.1:${port}/json/version`, { signal: AbortSignal.timeout(2_000) }); return r.ok })
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`)
    page = await until(() => browser.contexts().flatMap(context => context.pages()).find(p => p.url().startsWith('http://tauri.localhost') || p.url().startsWith('tauri://localhost')))
    const origin = await page.evaluate(() => location.origin)
    if (phase === 'initial') {
      execFileSync('python', ['scripts/distribution/verify-packaged-locales.py', exe, '--expected-count', '120'], { stdio: 'inherit' })
      await page.goto(origin + '/')
      receipt.autoTune = await page.evaluate(checkAutoTune)
    }
    await page.goto(origin + '/settings/general')
    // These calls exercise the shipping backend; they neither intercept IPC nor
    // replace updater/network services.
    const call = (command, args = {}) => page.evaluate(({ command, args }) => window.__TAURI_INTERNALS__.invoke(command, args), { command, args })
    const configuration = await call('get_app_configurations')
    const modelDirectory = await call('model_download_directory', { modelId: 'portable-preservation-fixture' })
    if (path.resolve(configuration.data_folder) !== path.join(portableRoot, 'Data/Novera/data') || !path.resolve(modelDirectory).startsWith(path.join(portableRoot, 'Data/Models') + path.sep)) throw new Error('Portable storage escaped into the Windows profile')
    const witnessPath = path.join(portableRoot, 'Data/portable-ui-witness.json')
    if (!fs.existsSync(witnessPath)) {
      const thread = await call('create_thread', { thread: { title: 'Portable preservation fixture', created: Date.now(), updated: Date.now(), assistants: [] } })
      const attachment = path.join(data, 'portable-attachment.txt')
      fs.writeFileSync(attachment, 'Synthetic portable attachment; no personal data.')
      await call('create_message', { message: { thread_id: thread.id, role: 'user', status: 'ready', content: [{ type: 'text', text: { value: 'Synthetic portable discussion', annotations: [] } }, { type: 'text', text: { value: attachment, annotations: [] } }], portableAttachment: attachment } })
      await call('settings_set', { key: 'portable-ci-witness', value: 'preserved portable setting' })
      await call('set_secret', { key: 'portable-ci-synthetic', value: 'synthetic portable secret, never a real key' })
      const model = path.join(modelDirectory, 'model.gguf')
      fs.writeFileSync(model, 'GGUF synthetic fixture; not an inference model')
      fs.writeFileSync(witnessPath, JSON.stringify({ threadId: thread.id, literalPathText: attachment, modelRelative: path.relative(portableRoot, model), modelSha256: createHash('sha256').update(fs.readFileSync(model)).digest('hex') }))
      await until(() => fs.readFileSync(path.join(data, 'settings.json'), 'utf8').includes('preserved portable setting'))
    }
    const witness = JSON.parse(fs.readFileSync(witnessPath))
    if (await call('get_secret', { key: 'portable-ci-synthetic' }) !== 'synthetic portable secret, never a real key') throw new Error('Portable Windows-protected secret did not survive')
    if (await call('settings_get', { key: 'portable-ci-witness' }) !== 'preserved portable setting') throw new Error('Portable setting was lost')
    const threads = await call('list_threads')
    const messages = await call('list_messages', { threadId: witness.threadId })
    if (!threads.some(t => t.id === witness.threadId) || !messages.some(m => m.portableAttachment === path.join(data, 'portable-attachment.txt') && m.content[0].text.value === 'Synthetic portable discussion' && m.content[1].text.value === witness.literalPathText)) throw new Error('Portable discussion/attachment was lost, changed or failed to relocate')
    if (createHash('sha256').update(fs.readFileSync(path.join(portableRoot, witness.modelRelative))).digest('hex') !== witness.modelSha256) throw new Error('Portable model changed')
    if (!fs.existsSync(path.join(portableRoot, 'Data/WebView')) || fs.existsSync(path.join(locations.APPDATA, 'Novera'))) throw new Error('Portable WebView/profile isolation failed')
    Object.assign(receipt, { nativeProfileReadWriteVerified: true, windowsProtectedSecretPreserved: true, modelBytesPreserved: true, settingPreserved: true, discussionPreserved: true, attachmentPathRebased: true, configuredDataDirectory: configuration.data_folder, modelDirectory })
    const button = page.getByRole('button', { name: /^check for updates$/i })
    await button.waitFor({ state: 'visible', timeout: 60_000 })
    if (!(await page.locator('body').innerText()).includes(applicationVersion)) throw new Error('Expected the real application version in Settings')
    await button.click()
    await page.getByText(expected.text, { exact: true }).waitFor({ state: 'visible', timeout: 45_000 })
    const text = await page.locator('body').innerText()
    const opposite = expected.supported ? 'Failed to check for updates' : "You're running the latest version"
    if (text.includes(opposite)) throw new Error('UI disagrees with the actual production feed')
    if (!(await button.isEnabled())) throw new Error('Manual check button did not become available again')
    await page.screenshot({ path: path.join(out, 'PORTABLE-UI-'+phase+'.png'), fullPage: true })
    Object.assign(receipt, { nativeUiCheckPassed: true, productionManualCheckValidated: expected.supported, observedMessage: expected.text, visibleText: text, settingsOrigin: origin })
  } catch (error) {
    receipt.error = error.message
    if (!page) {
      const snapshot = spawnSync('powershell.exe', ['-NoProfile', '-File', path.resolve('scripts/distribution/capture-ci-native-desktop.ps1'), '-Executable', exe, '-OwnedProcessId', String(processHandle.pid), '-OutputFile', path.join(out, 'PORTABLE-UI-'+phase+'-desktop.png')], { env, windowsHide: true, encoding: 'utf8', timeout: 30_000 })
      receipt.nativeStartupDiagnostic = snapshot.stdout?.slice(-12000)
      if (snapshot.status !== 0) receipt.diagnosticError = snapshot.stderr?.slice(-4000)
    }
    if (page) { receipt.visibleTextAtFailure = await page.locator('body').innerText().catch(() => ''); await page.screenshot({ path: path.join(out, 'PORTABLE-UI-'+phase+'.png'), fullPage: true }).catch(() => {}) }
    throw error
  } finally {
    fs.writeFileSync(path.join(out, 'PORTABLE-UI-'+phase+'.json'), JSON.stringify(receipt, null, 2) + '\n')
    await browser?.close().catch(() => {})
    if (processHandle.pid) spawnSync('taskkill', ['/PID', String(processHandle.pid), '/T', '/F'], { windowsHide: true, stdio: 'ignore' })
  }
  console.log(JSON.stringify(receipt, null, 2))
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main(process.argv[2])
