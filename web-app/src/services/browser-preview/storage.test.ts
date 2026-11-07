import 'fake-indexeddb/auto'
import { afterEach, expect, it, vi } from 'vitest'
import { IDBDatabase } from 'fake-indexeddb'
import { BrowserThreadsService, flushBrowserConversations } from './storage'

afterEach(() => vi.restoreAllMocks())

it('waits for pending conversation writes before allowing a page reload', async () => {
  const service = new BrowserThreadsService()
  const thread = { id: crypto.randomUUID(), title: 'Before updating', updated: 1 } as Thread
  let committed = false
  const write = service.createThread(thread).then(() => { committed = true })
  await flushBrowserConversations()
  expect(committed).toBe(true)
  expect(await service.fetchThreads()).toContainEqual(thread)
  await write
  await service.deleteThread(thread.id)
})

it('refuses the reload barrier when the conversation database cannot start a transaction', async () => {
  await flushBrowserConversations()
  vi.spyOn(IDBDatabase.prototype, 'transaction').mockImplementation(() => {
    throw new DOMException('Database unavailable', 'InvalidStateError')
  })
  await expect(flushBrowserConversations()).rejects.toThrow('Database unavailable')
})
