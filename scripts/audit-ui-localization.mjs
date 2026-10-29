import ts from '../web-app/node_modules/typescript/lib/typescript.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve('web-app/src')
export function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
    if (/^(?:__|node_modules|locales)/.test(entry.name)) return []
    const file = path.join(dir, entry.name)
    return entry.isDirectory() ? walk(file) : /\.[jt]sx?$/.test(file) && !/\.(test|spec)\./.test(file) ? [file] : []
  })
}
export const findings = []
for (const file of walk(root)) {
  const source = fs.readFileSync(file, 'utf8')
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
  function visit(node) {
    let kind
    if (ts.isJsxText(node)) kind = 'text'
    else if (ts.isStringLiteral(node) && ts.isJsxAttribute(node.parent) && /^(title|label|placeholder|description|aria-label|alt|tooltip|emptyText)$/.test(node.parent.name.text)) kind = 'attribute'
    else if (ts.isStringLiteral(node) && /[A-Za-z]{2,} [A-Za-z]{2,}/.test(node.text) && !ts.isImportDeclaration(node.parent) && !ts.isExportDeclaration(node.parent)) kind = 'literal'
    if (kind) {
      const text = (ts.isJsxText(node) ? node.text : node.text).replace(/\s+/g, ' ').trim()
      if (/[A-Za-z]/.test(text)) findings.push({ file: path.relative(root, file).replaceAll('\\', '/'), line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, kind, text })
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const target = process.argv[2]
  if (target) fs.writeFileSync(target, JSON.stringify(findings, null, 2) + '\n')
  else console.log(JSON.stringify(findings, null, 2))
}
