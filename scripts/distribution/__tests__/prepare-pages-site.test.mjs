import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { preparePagesSite } from '../prepare-pages-site.mjs'

test('Pages links the verified Windows/Linux release without hosting the Web application', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'novera-pages-'))
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
  const out=path.join(root,'site');const result=preparePagesSite(out,'a'.repeat(40))
  assert.deepEqual(fs.readdirSync(out).sort(),['assets','index.html','pages-probe.json'])
  assert.deepEqual(fs.readdirSync(path.join(out,'assets')).sort(),['banner.png','dashboard.png'])
  assert.equal(result.applicationPublished,false);assert.equal(result.publicDownloadsEnabled,true);assert.equal(result.desktopReleaseVersion,'1.0.0')
  const html=fs.readFileSync(path.join(out,'index.html'),'utf8')
  assert.match(html,/Windows x64, Windows ARM64 et Linux x64 sont disponibles/);assert.match(html,/releases\/tag\/v1\.0\.0/)
  assert.match(html,/TRON-ABS/);assert.match(html,/The art of Human with AI/)
  assert.match(html,/releases\/tag\/v1\.0\.0-windows-portable/);assert.match(html,/modèles téléchargés restent dans son dossier Data/);assert.match(html,/Mr Sachet Jean-Marc — Chercheur indépendant — France/);assert.match(html,/GPT-6\.1 Sol/)
  assert.match(html,/releases\/tag\/v1\.0\.0-cli-novera/)
  assert.match(html,/novera\.exe sous Windows et novera sous Linux/)
  assert.match(html,/Android : validation en cours/)
  assert.equal(result.androidStatus,'device-test-in-progress')
  assert.deepEqual(result.cliExecutableNames,['novera.exe','novera'])
  assert.doesNotMatch(html,/<script\b|latest\.json|latest-cli\.json|releases\/download\//i)
  assert.throws(()=>preparePagesSite(out,'a'.repeat(40)),/already exists/)
})

test('Pages staging refuses an unreviewed or injected source identity before creating files', () => {
  for(const commit of ['main','<script>','a'.repeat(39)])assert.throws(()=>preparePagesSite('unused',commit),/exact reviewed/)
})
