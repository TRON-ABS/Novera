export function prepareBrowserRuntime(folder: string | undefined): {
  directory: string
  assets: Array<{ name: string; source: Uint8Array }>
}
