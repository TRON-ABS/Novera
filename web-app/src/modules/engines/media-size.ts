export const mediaRatios = [
  '1:1',
  '16:9',
  '9:16',
  '4:3',
  '3:4',
  '21:9',
  '9:21',
  '16:10',
  '10:16',
  '3:2',
  '2:3',
  '5:4',
  '4:5',
  '2:1',
  '1:2',
  '3:1',
  '1:3',
  '32:9',
  '9:32',
] as const
export const mediaResolutions = [
  512, 768, 1024, 1280, 1536, 1920, 2048,
] as const
export function ratioNumbers(ratio: string): [number, number] {
  const values = ratio
    .replace(/^custom:/, '')
    .split(':')
    .map(Number)
  if (values.length !== 2 || values.some((n) => !Number.isFinite(n) || n <= 0))
    throw new Error('Invalid ratio')
  if (Math.max(...values) / Math.min(...values) > 32)
    throw new Error('Unsupported ratio')
  return values as [number, number]
}
export function fitMediaRatio(
  ratio: string,
  currentResolution: number
): { width: number; height: number } {
  const [x, y] = ratioNumbers(ratio)
  const largest = Math.max(x, y),
    smallest = Math.min(x, y)
  // Preserve the current long edge except when a minimum 64 px side requires
  // more room. Every native request remains within 64..2048 on a 16 px grid.
  const extent = Number.isFinite(currentResolution) ? currentResolution : 512
  const edge = Math.min(
    2048,
    Math.max(
      64,
      Math.floor(extent / 16) * 16,
      Math.ceil((64 * largest) / smallest / 16) * 16
    )
  )
  const align = (v: number) =>
    Math.min(2048, Math.max(64, Math.round(v / 16) * 16))
  return {
    width: align((edge * x) / largest),
    height: align((edge * y) / largest),
  }
}
export function inferMediaRatio(width: number, height: number): string {
  return (
    mediaRatios.find((r) => {
      const [x, y] = r.split(':').map(Number)
      return width * y === height * x
    }) ?? `custom:${width}:${height}`
  )
}
