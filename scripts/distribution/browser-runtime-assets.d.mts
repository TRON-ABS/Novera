export function prepareBrowserRuntime(folder: string | undefined, kind?: 'image' | 'music' | 'text', memory64?: boolean): {
  directory: string
  assets: Array<{ name: string; source: Uint8Array }>
}
