/** Resolve bundled images below the deployment base; preserve external/data URLs. */
export function publicAsset(value: string): string {
  return value.startsWith('/images/') ? `${import.meta.env.BASE_URL}${value.slice(1)}` : value
}
