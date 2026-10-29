import ts from '../web-app/node_modules/typescript/lib/typescript.js'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { walk, findings } from './audit-ui-localization.mjs'

export function checkUiLocalization() {
  const root = path.resolve('web-app/src')
  const bundles = Object.fromEntries(fs.readdirSync(path.join(root, 'locales/en'))
    .filter(name => name.endsWith('.json'))
    .map(name => [name.slice(0, -5), JSON.parse(fs.readFileSync(path.join(root, 'locales/en', name), 'utf8'))]))
  const invariants = JSON.parse(fs.readFileSync('scripts/fixtures/ui-invariant-text.json', 'utf8'))
  const allowed = new Set(invariants.map(entry => entry.text))
  const unreviewedLiterals = findings.filter(entry => entry.kind !== 'literal' && !allowed.has(entry.text))
  const missingKeys = [], dynamicCalls = []
  let staticCalls = 0
  const has = (obj, key) => key.split('.').reduce((value, part) => value?.[part], obj) !== undefined
  for (const file of walk(root)) {
    const source = fs.readFileSync(file, 'utf8')
    if (!/i18n|useTranslation|useAppTranslation/.test(source)) continue
    const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS)
    function inspect(key, node) {
      if (!key) return
      const [namespace, name] = key.includes(':') ? key.split(':', 2) : ['common', key]
      staticCalls++
      if (!has(bundles[namespace], name) && !has(bundles[namespace], name + '_one') && !has(bundles[namespace], name + '_other')) {
        missingKeys.push({ file: path.relative(root, file).replaceAll('\\', '/'), line: tree.getLineAndCharacterOfPosition(node.getStart()).line + 1, key })
      }
    }
    function visit(node) {
      if (ts.isCallExpression(node) && /^(?:t|uiT|i18n\.t|i18next\.t)$/.test(node.expression.getText(tree)) && node.arguments.length) {
        const arg = node.arguments[0]
        function inspectArgument(value) {
          if (ts.isStringLiteralLike(value)) inspect(value.text, node)
          else if (ts.isConditionalExpression(value)) {
            inspectArgument(value.whenTrue); inspectArgument(value.whenFalse)
          } else dynamicCalls.push({ file: path.relative(root, file).replaceAll('\\', '/'), expression: value.getText(tree) })
        }
        inspectArgument(arg)
      }
      ts.forEachChild(node, visit)
    }
    visit(tree)
  }
  return { staticCalls, missingKeys, unreviewedLiterals, dynamicCalls, compiled: false }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkUiLocalization()
  console.log(JSON.stringify(result, null, 2))
  process.exitCode = Number(Boolean(result.missingKeys.length || result.unreviewedLiterals.length))
}
