import test from 'node:test'
import assert from 'node:assert/strict'
import { upgradeResult } from '../record-upgrade-check.mjs'

test('retains an actually executed successful migration suite', () => {
  assert.deepEqual(upgradeResult('running 9 tests\n\x1b[32mtest result: ok. 9 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.1s\x1b[0m'), { passed: 9, failed: 0, ignored: 0 })
})
test('rejects zero-test, failed, ignored, missing and ambiguous suite results', () => {
  for (const output of [
    'test result: ok. 0 passed; 0 failed; 0 ignored;',
    'test result: FAILED. 8 passed; 1 failed; 0 ignored;',
    'test result: ok. 8 passed; 0 failed; 1 ignored;',
    'Compilation finished',
    'test result: ok. 9 passed; 0 failed; 0 ignored;\ntest result: FAILED. 0 passed; 1 failed; 0 ignored;',
  ]) assert.throws(() => upgradeResult(output))
})
