import test from 'node:test'
import assert from 'node:assert/strict'
import { inspectModule, checkArchitecture } from '../check-architecture.mjs'

const file = 'web-app/src/modules/engines/example.ts'
test('engine policies cannot pull React, UI stores or native IPC', () => {
  for (const specifier of ['react', '@/hooks/useAppState', '@tauri-apps/api/core']) {
    assert.equal(inspectModule(`import value from '${specifier}'`, file, 'engines').length, 1)
  }
})
test('typed SDK contracts are allowed, runtime SDK imports are not', () => {
  assert.deepEqual(inspectModule("import type { MetadataExtractor } from '@ai-sdk/openai-compatible'", file, 'engines'), [])
  assert.equal(inspectModule("import { createOpenAICompatible } from '@ai-sdk/openai-compatible'", file, 'engines').length, 1)
})
test('relative imports cannot escape the declared boundary', () => {
  assert.deepEqual(inspectModule("import type { EngineStreamProgress } from './contracts'", file, 'engines'), [])
  assert.equal(inspectModule("import { useAppState } from '../../hooks/useAppState'", file, 'engines').length, 1)
})
test('dynamic and re-export imports are checked too', () => {
  assert.equal(inspectModule("export * from '@/hooks/useAppState'", file, 'engines').length, 1)
  assert.equal(inspectModule("const module = import('@/hooks/useAppState')", file, 'engines').length, 1)
  assert.equal(inspectModule('const module = import(path)', file, 'engines').length, 1)
})
test('pure policies cannot read DOM or persisted UI settings', () => {
  assert.equal(inspectModule('document.documentElement.lang = "fr"', file, 'engines').length, 1)
  assert.equal(inspectModule('localStorage.getItem("settings")', file, 'engines').length, 1)
})
test('conversation-to-tool dependency is explicit and one-way', () => {
  assert.deepEqual(inspectModule("import { stripToolImageSentinels } from '@/modules/tools/tool-images'", 'web-app/src/modules/conversations/context.ts', 'conversations'), [])
  assert.equal(inspectModule("import { trimMessages } from '@/modules/conversations/context'", 'web-app/src/modules/tools/example.ts', 'tools').length, 1)
})
test('all currently extracted modules satisfy their boundaries', () => {
  const result = checkArchitecture()
  assert.equal(result.areas, 6)
  assert.ok(result.checkedFiles >= 10)
  assert.deepEqual(result.violations, [])
})
