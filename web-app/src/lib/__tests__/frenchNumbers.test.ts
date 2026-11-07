import {describe,it,expect} from 'vitest'
import {frenchNumbers} from '../frenchNumbers'
describe('French speech numbers',()=>{
 it.each([
  ['1889','mille huit cent quatre-vingt-neuf'],['2019','deux mille dix-neuf'],
  ['71','soixante-et-onze'],['80','quatre-vingts'],['81','quatre-vingt-un'],
  ['200','deux cents'],['201','deux cent un'],['80000','quatre-vingt mille'],
  ['200000','deux cent mille'],['2000000','deux millions'],
  ['2,05','deux virgule zéro cinq'],['007','zéro zéro sept'],['1\u202f000','mille'],
 ])('speaks %s without losing its value',(input,output)=>expect(frenchNumbers(input,'fr-FR')).toBe(output))
 it('handles years and metro numbers inside prose',()=>{
  expect(frenchNumbers('Construite en 1889. Lignes 1, 4 et 14.','fr')).toBe('Construite en mille huit cent quatre-vingt-neuf. Lignes un, quatre et quatorze.')
 })
 it('keeps identifiers, dates, versions and non-French speech unchanged',()=>{
  const text='LFM3 Q4_K_M v1.0.1 2026/11/07 https://example.org/123'
  expect(frenchNumbers(text,'fr')).toBe(text)
  expect(frenchNumbers('In 1889.','en')).toBe('In 1889.')
 })
})
