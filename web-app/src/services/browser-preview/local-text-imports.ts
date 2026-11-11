import { notifyBrowserAutoTuneSourcesChanged } from './auto-tune-registry'

export type BrowserLocalTextModel = { id: string; file: File }
const imported = new Map<string, BrowserLocalTextModel>()

export const browserLocalTextModels = () => [...imported.values()]

export async function registerBrowserLocalTextModel(file: File) {
  if (!/\.gguf$/i.test(file.name) || file.size <= 24) return
  const header = new DataView(await file.slice(0, 24).arrayBuffer())
  if (header.getUint32(0, true) !== 0x46554747 ||
      ![2, 3].includes(header.getUint32(4, true)) ||
      header.getBigUint64(8, true) === 0n || header.getBigUint64(16, true) === 0n) return

  // The published wasm32 GGUF parser accumulates tensor sizes in a 32-bit size_t.
  if (file.size >= 2 ** 32) throw new Error('Ce GGUF atteint la limite de 4 Gio du moteur texte Web.')

  const id = JSON.stringify([file.name, file.size, file.lastModified])
  if (!imported.has(id)) {
    imported.set(id, { id, file })
    notifyBrowserAutoTuneSourcesChanged()
  }
  return imported.get(id)
}
