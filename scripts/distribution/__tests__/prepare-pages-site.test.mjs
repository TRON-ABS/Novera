import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { preparePagesSite } from '../prepare-pages-site.mjs'

test('Pages links the verified desktop and Android releases without hosting the Web application', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'novera-pages-'))
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
  const out=path.join(root,'site');const result=preparePagesSite(out,'a'.repeat(40))
  assert.deepEqual(fs.readdirSync(out).sort(),['assets','index.html','pages-probe.json'])
  assert.deepEqual(fs.readdirSync(path.join(out,'assets')).sort(),['banner.png','dashboard.png'])
  assert.equal(result.applicationPublished,false);assert.equal(result.publicDownloadsEnabled,true);assert.equal(result.desktopReleaseVersion,'1.0.0')
  assert.equal(result.preparedSourceVersion,'1.0.1')
  assert.equal(result.preparedVersionPublished,false)
  assert.equal(result.readmeLanguageCount,104)
  assert.equal(result.preparedMediaPresets,58)
  const html=fs.readFileSync(path.join(out,'index.html'),'utf8')
  assert.match(html,/Préparation de la version 1\.0\.1/)
  assert.match(html,/commandes du bas se replient en gardant la saisie visible/)
  assert.match(html,/58 préréglages média/)
  assert.doesNotMatch(html,/releases\/(?:tag|download)\/v1\.0\.1/)
  const languageLinks = [...html.matchAll(/class="button" dir="auto" href="[^"]+\/README(?:\.[^"/]+)?\.md"/g)]
  assert.equal(languageLinks.length,104)
  assert.match(html,/Windows x64, Windows ARM64, Linux x64, macOS et Android ARM64 sont disponibles/);assert.match(html,/releases\/tag\/v1\.0\.0/)
  assert.match(html,/TRON-ABS/);assert.match(html,/The art of Human with AI/)
  assert.match(html,/releases\/tag\/v1\.0\.0-windows-portable/);assert.match(html,/modèles téléchargés restent dans son dossier Data/);assert.match(html,/Mr Sachet Jean-Marc — Chercheur indépendant — France/);assert.match(html,/GPT-6\.1 Sol/)
  assert.match(html,/releases\/tag\/v1\.0\.0-cli-novera/)
  assert.match(html,/novera\.exe sous Windows et novera sous Linux/)
  assert.match(html,/Android 1\.0\.0 est disponible en APK signé/)
  assert.match(html,/confirme le bon fonctionnement du build 1000012/)
  assert.match(html,/téléphone moderne/);assert.match(html,/fournisseur API/);assert.match(html,/16K tokens/)
  assert.match(html,/taille de lot Android par défaut est <strong>512/)
  assert.equal(result.macosReleaseTag,'v1.0.0-macos')
  assert.equal(result.macosAppleNotarized,false)
  assert.match(html,/Novera_1\.0\.0_aarch64\.dmg/)
  assert.match(html,/Novera_1\.0\.0_x64\.dmg/)
  assert.match(html,/Ouvrir quand même/)
  assert.match(html,/iOS reste en préparation/)
  assert.equal(result.androidStatus,'maintainer-confirmed-public')
  assert.equal(result.androidVersionCode,1000012)
  assert.equal(result.androidReleaseTag,'v1.0.0-android-1000012')
  assert.match(html,/href="https:\/\/github\.com\/TRON-ABS\/Novera\/releases\/download\/v1\.0\.0-android-1000012\/Novera_1\.0\.0_android-arm64\.apk"/)
  assert.doesNotMatch(html,/Android : validation en cours|releases\/download\/v1\.0\.0-android\//)
  assert.deepEqual(result.cliExecutableNames,['novera.exe','novera'])
  assert.doesNotMatch(html,/<script\b|latest\.json|latest-cli\.json/i)
  assert.throws(()=>preparePagesSite(out,'a'.repeat(40)),/already exists/)
})

test('Pages staging refuses an unreviewed or injected source identity before creating files', () => {
  for(const commit of ['main','<script>','a'.repeat(39)])assert.throws(()=>preparePagesSite('unused',commit),/exact reviewed/)
})
