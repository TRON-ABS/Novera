import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { it, expect } from 'vitest'
const root=resolve(import.meta.dirname,'../../../..')
const locales=JSON.parse(readFileSync(resolve(root,'docs/language-support.json'),'utf8')) as {locale:string}[]
const english=JSON.parse(readFileSync(resolve(root,'web-app/src/locales/en/hub.json'),'utf8')).discovery
it.each(locales)('translates all Hub discovery controls directly in $locale',({locale})=>{
  const actual=JSON.parse(readFileSync(resolve(root,'web-app/src/locales',locale,'hub.json'),'utf8')).discovery
  expect(Object.keys(actual).sort()).toEqual(Object.keys(english).sort())
  for(const v of Object.values(actual))expect(typeof v==='string'&&v.trim().length>0).toBe(true)
})
