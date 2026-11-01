import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { preparePagesSite } from '../prepare-pages-site.mjs'

test('Pages launch information contains only reviewed presentation assets, without application delivery', t => {
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'novera-pages-'))
  t.after(()=>fs.rmSync(root,{recursive:true,force:true}))
  const out=path.join(root,'site');const result=preparePagesSite(out,'a'.repeat(40))
  assert.deepEqual(fs.readdirSync(out).sort(),['assets','index.html','pages-probe.json'])
  assert.deepEqual(fs.readdirSync(path.join(out,'assets')).sort(),['banner.png','dashboard.png'])
  assert.equal(result.applicationPublished,false);assert.equal(result.publicDownloadsEnabled,false)
  const html=fs.readFileSync(path.join(out,'index.html'),'utf8')
  assert.match(html,/téléchargements publics ne sont pas encore ouverts/)
  assert.match(html,/TRON-ABS/);assert.match(html,/The art of Human with AI/)
  assert.doesNotMatch(html,/<script\b|\.exe\b|latest\.json|latest-cli\.json|releases\/download\//i)
  assert.throws(()=>preparePagesSite(out,'a'.repeat(40)),/already exists/)
})

test('Pages staging refuses an unreviewed or injected source identity before creating files', () => {
  for(const commit of ['main','<script>','a'.repeat(39)])assert.throws(()=>preparePagesSite('unused',commit),/exact reviewed/)
})
