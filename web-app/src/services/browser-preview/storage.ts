import type { Assistant, ThreadMessage } from '@janhq/core'
import type { ThreadsService } from '../threads/types'
import type { MessagesService } from '../messages/types'
import type { AssistantsService } from '../assistants/types'
import { TEMPORARY_CHAT_ID } from '@/constants/chat'

type Store = 'threads' | 'messages' | 'assistants'
let connection: Promise<IDBDatabase> | undefined
function database() {
  if (!connection) connection = new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open('novera-browser-conversations-v1', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      db.createObjectStore('threads', { keyPath: 'id' })
      db.createObjectStore('messages', { keyPath: 'id' }).createIndex('thread', 'thread_id')
      db.createObjectStore('assistants', { keyPath: 'id' })
    }
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); connection = undefined }
      resolve(request.result)
    }
    request.onerror = () => { connection = undefined; reject(request.error ?? new Error('Stockage navigateur indisponible.')) }
    request.onblocked = () => { connection = undefined; reject(new Error('Fermez les autres onglets Novera avant de mettre le stockage à jour.')) }
  })
  return connection
}

async function all<T>(store: Store, threadId?: string): Promise<T[]> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readonly')
    const source = transaction.objectStore(store)
    const request = threadId ? source.index('thread').getAll(threadId) : source.getAll()
    let result: T[] = []
    request.onsuccess = () => { result = request.result }
    transaction.oncomplete = () => resolve(result)
    transaction.onabort = transaction.onerror = () => reject(transaction.error ?? new Error('Lecture des discussions impossible.'))
  })
}

async function write(store: Store, value: { id: string } | string, remove = false): Promise<void> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(store, 'readwrite')
    const source = transaction.objectStore(store)
    if (remove) source.delete(value as string)
    else source.put(value)
    transaction.oncomplete = () => resolve()
    transaction.onabort = transaction.onerror = () => reject(transaction.error ?? new Error('Enregistrement impossible. Vérifiez l’espace du navigateur.'))
  })
}

/** A read transaction waits behind already queued writes to these stores. */
export async function flushBrowserConversations(): Promise<void> {
  const db = await database()
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['threads', 'messages', 'assistants'], 'readonly')
    transaction.oncomplete = () => resolve()
    transaction.onabort = transaction.onerror = () => reject(transaction.error ?? new Error('Enregistrement des discussions non terminé.'))
  })
}

export class BrowserThreadsService implements ThreadsService {
  async fetchThreads(): Promise<Thread[]> {
    return (await all<Thread>('threads')).filter(thread => thread.id !== TEMPORARY_CHAT_ID).sort((a, b) => (b.updated ?? 0) - (a.updated ?? 0))
  }
  async createThread(thread: Thread) {
    if (thread.id !== TEMPORARY_CHAT_ID) await write('threads', thread)
    return thread
  }
  async updateThread(thread: Thread) {
    if (thread.id !== TEMPORARY_CHAT_ID) await write('threads', thread)
  }
  async deleteThread(id: string) {
    if (id === TEMPORARY_CHAT_ID) return
    const db = await database()
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(['threads', 'messages'], 'readwrite')
      transaction.objectStore('threads').delete(id)
      const request = transaction.objectStore('messages').index('thread').openKeyCursor(IDBKeyRange.only(id))
      request.onsuccess = () => {
        const cursor = request.result
        if (cursor) { transaction.objectStore('messages').delete(cursor.primaryKey); cursor.continue() }
      }
      transaction.oncomplete = () => resolve()
      transaction.onabort = transaction.onerror = () => reject(transaction.error ?? new Error('Suppression de la discussion impossible.'))
    })
  }
}

export class BrowserMessagesService implements MessagesService {
  async fetchMessages(id: string) {
    return id === TEMPORARY_CHAT_ID ? [] : (await all<ThreadMessage>('messages', id)).sort((a, b) => a.created_at - b.created_at)
  }
  async createMessage(message: ThreadMessage) {
    if (message.thread_id !== TEMPORARY_CHAT_ID) await write('messages', message)
    return message
  }
  async modifyMessage(message: ThreadMessage) {
    if (message.thread_id !== TEMPORARY_CHAT_ID) await write('messages', message)
    return message
  }
  async deleteMessage(threadId: string, messageId: string) {
    if (threadId === TEMPORARY_CHAT_ID) return
    const messages = await all<ThreadMessage>('messages', threadId)
    if (!messages.some(message => message.id === messageId)) throw new Error('Ce message n’appartient pas à la discussion.')
    await write('messages', messageId, true)
  }
}

export class BrowserAssistantsService implements AssistantsService {
  getAssistants() { return all<Assistant>('assistants') }
  async createAssistant(assistant: Assistant) { await write('assistants', assistant) }
  async deleteAssistant(assistant: Assistant) { await write('assistants', assistant.id, true) }
}
