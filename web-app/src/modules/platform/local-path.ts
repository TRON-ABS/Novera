/** Verbatim Windows paths do not accept forward slashes at the OS boundary. */
export function normalizeLocalPath(path: string): string {
  return path.startsWith('\\\\?\\') ? path.replaceAll('/', '\\') : path
}

export function joinLocalPath(directory: string, name: string): string {
  return normalizeLocalPath(`${directory.replace(/[\\/]+$/, '')}/${name}`)
}
