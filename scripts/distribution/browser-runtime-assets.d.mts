export function prepareBrowserRuntime(folder: string | undefined, kind?: 'image' | 'music'): {
  directory: string
  assets: Array<{ name: string; source: Uint8Array }>
}
