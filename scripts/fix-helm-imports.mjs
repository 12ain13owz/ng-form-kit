// Rewrites `@spartan-ng/helm/<name>` imports inside the library to relative paths.
//
// The spartan CLI writes helm components that import each other through the
// `@spartan-ng/helm/*` alias. That works in an app, but ng-packagr does not rewrite path aliases,
// so the published package would import `@spartan-ng/helm/utils`, which no consumer has. Run this
// after every `ng g @spartan-ng/cli:ui <name>` (npm run helm:fix), then remove the alias the CLI
// added to tsconfig.json.
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const helmRoot = join(root, 'projects/ng-form-kit/src/lib/ui')
const aliasPattern = /(['"])@spartan-ng\/helm\/([a-z-]+)\1/g

const walk = (dir) =>
  readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry)
    return statSync(path).isDirectory() ? walk(path) : path.endsWith('.ts') ? [path] : []
  })

let changed = 0
for (const file of walk(helmRoot)) {
  const source = readFileSync(file, 'utf8')
  const next = source.replace(aliasPattern, (_match, quote, name) => {
    let target = relative(dirname(file), join(helmRoot, name, 'src'))
      .split(sep)
      .join('/')
    if (!target.startsWith('.')) target = `./${target}`
    return `${quote}${target}${quote}`
  })
  if (next !== source) {
    writeFileSync(file, next)
    changed++
  }
}

// Drop the aliases the CLI put in tsconfig.json so nothing can import through them again.
const tsconfigPath = join(root, 'tsconfig.json')
const tsconfig = readFileSync(tsconfigPath, 'utf8')
const withoutAliases = tsconfig.replace(/\s*"@spartan-ng\/helm\/[a-z-]+": \[[^\]]*\],?/g, '')
if (withoutAliases !== tsconfig) writeFileSync(tsconfigPath, withoutAliases)

console.log(`helm imports: ${changed} file(s) rewritten`)
