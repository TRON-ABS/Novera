import {describe,it,expect} from 'vitest'
import {spokenMath} from '../spokenMath'
import {spokenText} from '../voiceConversation'
describe('numeric speech language cues',()=>{
 it('makes the screenshot expression unambiguously French for speech',()=>{
  expect(spokenMath('2 + 2 = 4','fr-FR')).toBe('Calcul : deux plus deux égale quatre.')
  expect(spokenMath('4','fr')).toBe('Résultat : quatre.')
  expect(spokenMath(spokenText('3 + 7 = 10 [[cite:https://fr.wikipedia.org/wiki/Addition]]'),'fr')).toBe('Calcul : trois plus sept égale dix.')
 })
 it('keeps decimal values and does not treat a date as division',()=>{
  expect(spokenMath('2,5 + 2 = 4,5','fr')).toContain('2,5 plus deux égale 4,5')
  expect(spokenMath('2026/11/07','fr')).toBe('2026/11/07')
 })
 it('normalizes supported arithmetic without changing normal prose or unsupported locales',()=>{
  expect(spokenMath('2 + 2 = 4','es')).toBe('Cálculo: 2 más 2 igual a 4.')
  expect(spokenMath('2 + 2 = 4','en')).toBe('Calculation: 2 plus 2 equals 4.')
  expect(spokenMath('Le résultat est 4.','fr')).toBe('Le résultat est 4.')
  expect(spokenMath('2 + 2 = 4','rw')).toBe('2 + 2 = 4')
 })
})
