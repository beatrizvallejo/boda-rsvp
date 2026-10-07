import { execSync } from 'node:child_process'

/**
 * Antes de cada ejecución: `.data/` vacío y con los datos de ejemplo (`pnpm seed`), para que los tests
 * partan siempre del mismo estado. Solo contra un servidor local (adaptador `local`): con
 * `PLAYWRIGHT_BASE_URL` apuntando a otro sitio no se toca nada.
 */
export default function globalSetup() {
  const base = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'
  if (!/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(base)) return
  execSync('pnpm seed', { stdio: 'inherit' })
}
