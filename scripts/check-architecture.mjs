#!/usr/bin/env node
// Offline dependency-boundary check for the modules already extracted from legacy code.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { resolve, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const ts = require('../web-app/node_modules/typescript')
export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
export const policy = JSON.parse(readFileSync(resolve(root, 'architecture/modules.json'), 'utf8'))
const inside = (path, directory) => path === directory || path.startsWith(directory + '/')
const portable = (path) => path.replaceAll('\\', '/')
const areaFor = (path) => policy.areas.find((area) => area.strictRoots.some((base) => inside(path, base)))

export function inspectModule(source, file, areaId) {
  const area = policy.areas.find((candidate) => candidate.id === areaId)
  if (!area) throw new Error(`Unknown area ${areaId}`)
  const tree = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true)
  const violations = []
  function check(specifier, typeOnly) {
    if (specifier === undefined) {
      violations.push(`${file}: non-literal module access is not allowed in checked modules`)
      return
    }
    const direct = [...area.runtimeImports, ...(typeOnly ? area.typeImports : [])]
    if (direct.some((allowed) => allowed.endsWith(':') ? specifier.startsWith(allowed) : specifier === allowed)) return
    let target
    if (specifier.startsWith('@/')) target = portable(relative(root, resolve(root, 'web-app/src', specifier.slice(2))))
    else if (specifier.startsWith('.')) target = portable(relative(root, resolve(root, dirname(file), specifier)))
    if (target) {
      const destination = areaFor(target)
      if (destination && (destination.id === area.id || area.allowedAreas.includes(destination.id))) return
    }
    violations.push(`${file}: ${area.id} cannot import ${specifier}${typeOnly ? ' (type)' : ''}`)
  }
  function visit(node) {
    if (ts.isImportDeclaration(node)) {
      const bindings = node.importClause?.namedBindings
      const namedTypesOnly = bindings && ts.isNamedImports(bindings) && bindings.elements.length > 0 && bindings.elements.every((item) => item.isTypeOnly)
      check(node.moduleSpecifier.text, !!node.importClause?.isTypeOnly || !!namedTypesOnly)
    } else if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
      check(node.moduleSpecifier.text, node.isTypeOnly)
    } else if (ts.isImportTypeNode(node)) {
      check(ts.isLiteralTypeNode(node.argument) && ts.isStringLiteral(node.argument.literal) ? node.argument.literal.text : undefined, true)
    } else if (ts.isCallExpression(node) && (node.expression.kind === ts.SyntaxKind.ImportKeyword || (ts.isIdentifier(node.expression) && node.expression.text === 'require'))) {
      check(node.arguments.length && ts.isStringLiteralLike(node.arguments[0]) ? node.arguments[0].text : undefined, false)
    }
    if (area.pure && ts.isIdentifier(node) && ['document', 'window', 'navigator', 'localStorage', 'sessionStorage'].includes(node.text)) {
      const parent = node.parent
      const isPropertyName = (ts.isPropertyAccessExpression(parent) && parent.name === node) || ((ts.isPropertyAssignment(parent) || ts.isPropertySignature(parent)) && parent.name === node)
      if (!isPropertyName) violations.push(`${file}: ${area.id} must receive ${node.text} data through an adapter`)
    }
    ts.forEachChild(node, visit)
  }
  visit(tree)
  return violations
}

function filesUnder(path) {
  if (!existsSync(path)) return []
  return readdirSync(path, { withFileTypes: true }).flatMap((entry) => {
    const file = resolve(path, entry.name)
    if (entry.isSymbolicLink()) return []
    if (entry.isDirectory()) return entry.name === '__tests__' ? [] : filesUnder(file)
    return /\.(?:ts|tsx|mjs|js)$/.test(entry.name) && !/\.(?:test|spec)\./.test(entry.name) ? [file] : []
  })
}

export function checkArchitecture() {
  const violations = []
  let checkedFiles = 0
  for (const area of policy.areas) {
    for (const path of [...area.sourceRoots, ...area.strictRoots]) {
      if (!existsSync(resolve(root, path))) violations.push(`Missing architecture path: ${path}`)
    }
    for (const base of area.strictRoots) {
      for (const path of filesUnder(resolve(root, base))) {
        const file = portable(relative(root, path))
        checkedFiles++
        violations.push(...inspectModule(readFileSync(path, 'utf8'), file, area.id))
      }
    }
  }
  return { areas: policy.areas.length, checkedFiles, violations }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = checkArchitecture()
  console.log(JSON.stringify(result, null, 2))
  if (result.violations.length) process.exitCode = 1
}
