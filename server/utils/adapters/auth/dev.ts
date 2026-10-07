import type { AuthAdapter } from './types'

/**
 * Acceso al panel sin login para desarrollo. La salvaguarda de `adapters/config.ts` impide que el
 * servidor de producción arranque con este adaptador; aquí se comprueba otra vez por si acaso.
 */
export function createDevAuthAdapter(): AuthAdapter {
  return {
    async getAdminSession() {
      if (!import.meta.dev) return null
      return { method: 'dev' }
    },
    async login() {
      return import.meta.dev
    },
    async logout() {},
  }
}
