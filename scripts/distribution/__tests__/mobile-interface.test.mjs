import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

test('both mobile builds create the main WebView without desktop width constraints', () => {
  for (const platform of ['android','ios']) {
    const config=JSON.parse(fs.readFileSync(`src-tauri/tauri.${platform}.conf.json`))
    const main=config.app.windows.find(w=>w.label==='main')
    assert.ok(main, `${platform}: startup window missing`)
    assert.equal(main.create,true)
    assert.equal(main.visible,true)
    assert.equal(main.url,'index.html')
    assert.equal(main.minWidth,undefined)
    assert.equal(main.width,undefined)
    assert.equal(config.build.frontendDist,'../web-app/dist')
  }
})

test('mobile keeps the shared palette and responsive settings navigation', () => {
  const css=fs.readFileSync('web-app/src/index.css','utf8')
  assert.match(css,/--color-primary:\s*var\(--primary\)/)
  assert.match(css,/@import ['"]@\/styles\/settings\.css['"]/)
  const settings=fs.readFileSync('web-app/src/styles/settings.css','utf8')
  assert.match(settings,/700px/)
  assert.match(settings,/480px/)
  const provider=fs.readFileSync('web-app/src/providers/ThemeProvider.tsx','utf8')
  assert.match(provider,/classList\.add\('dark'\)/)
  assert.match(provider,/classList\.remove\('dark'\)/)
})
