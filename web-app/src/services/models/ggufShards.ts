import type { HuggingFaceRepo } from './types'

type File = NonNullable<HuggingFaceRepo['siblings']>[number]
export const splitGgufName = (name: string) =>
  name.match(/^(.*)-(\d{5})-of-(\d{5})\.gguf$/i)

/** Only complete, unambiguous series become selectable variants. */
export function groupGgufFiles(files: File[]): File[][] {
  const singles: File[][] = []
  const groups = new Map<string, File[]>()
  for (const file of files) {
    const match = splitGgufName(file.rfilename)
    if (!match) {
      singles.push([file])
      continue
    }
    const key = `${match[1]}-${match[3]}`
    const group = groups.get(key) ?? []
    group.push(file)
    groups.set(key, group)
  }
  for (const group of groups.values()) {
    group.sort((a, b) => a.rfilename.localeCompare(b.rfilename))
    const count = Number(splitGgufName(group[0].rfilename)![3])
    if (
      count > 1 &&
      group.length === count &&
      group.every(
        (file, index) => Number(splitGgufName(file.rfilename)![2]) === index + 1
      )
    )
      singles.push(group)
  }
  return singles
}

export function hfFileUrl(
  repo: string,
  revision: string,
  filename: string
): string {
  return `https://huggingface.co/${repo}/resolve/${encodeURIComponent(revision)}/${filename.split('/').map(encodeURIComponent).join('/')}`
}
