import { expect, it, vi } from 'vitest'
import path, { resolve, relative } from '../browserPath'

it('resolves browser paths without a Node process shim', () => {
  const cwd = vi.spyOn(process, 'cwd').mockImplementation(() => { throw new Error('Node cwd is unavailable in a browser') })
  let results: string[]
  try {
    results = [resolve('relative', 'file.txt'), relative('a', 'b'), path.posix.resolve('a', '..', 'b'), path.join('a', 'b')]
  } finally {
    cwd.mockRestore()
  }
  expect(results!).toEqual(['/relative/file.txt', '../b', '/b', 'a/b'])
})
