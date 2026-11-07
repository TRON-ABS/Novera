import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

// Use the same TypeScript parser already required to compile the web app.
// Inspect syntax, so a translated string mentioning SETTINGS is harmless.
const require = createRequire(new URL('../../web-app/package.json', import.meta.url))
const ts = require('typescript')
const reserved = new Set(['SETTINGS', 'ENGINE', 'NODE', 'VERSION', 'IS_WINDOWS', 'IS_MAC', 'IS_LINUX'])
const packages = ['core', ...['assistant', 'conversational', 'download', 'llamacpp', 'mlx', 'rag', 'vector-db']
  .map(name => `extensions/${name}-extension`)]
const failures = []
for (const directory of packages) {
  const url = new URL(`../../${directory}/dist/index.js`, import.meta.url)
  const source = await readFile(url, 'utf8')
  const ast = ts.createSourceFile(fileURLToPath(url), source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS)
  const visit = node => {
    if (ts.isIdentifier(node) && reserved.has(node.text)) {
      const parent = node.parent
      const property = (ts.isPropertyAccessExpression(parent) && parent.name === node) ||
        ((ts.isPropertyAssignment(parent) || ts.isMethodDeclaration(parent)) && parent.name === node)
      if (!property) {
        const { line } = ast.getLineAndCharacterOfPosition(node.getStart(ast))
        failures.push(`${directory}/dist/index.js:${line + 1}: unreplaced build constant ${node.text}`)
      }
    }
    ts.forEachChild(node, visit)
  }
  visit(ast)
}
if (failures.length) {
  throw new Error(`Extension build constants must be replaced before packaging:\n${failures.join('\n')}`)
}
console.log(`Extension bundles: ${packages.length} checked, no unreplaced build constants`)
