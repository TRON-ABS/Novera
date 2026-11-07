import path from 'path-browserify'

// Match the former browser process shim's cwd ("/") without installing unused
// crypto/HTTP polyfills. Every call into relative() receives absolute paths.
export const resolve = (...parts: string[]) => path.resolve('/', ...parts)
export const relative = (from: string, to: string) => path.relative(resolve(from), resolve(to))
export const { normalize, isAbsolute, join, dirname, basename, extname, format, parse, sep, delimiter } = path
const browserPath = { ...path, resolve, relative }
browserPath.posix = browserPath
export const posix = browserPath
export const win32 = path.win32
export default browserPath
