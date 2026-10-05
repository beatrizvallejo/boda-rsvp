// https://nuxt.com/docs/api/configuration/nuxt-config
import { LOCAL_STORAGE_BASE, LOCAL_STORAGE_MOUNT } from './server/utils/adapters/data/local-keys'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  typescript: {
    strict: true,
  },
  eslint: {
    config: {
      // El formato lo lleva Prettier (eslint-config-prettier en eslint.config.mjs)
      stylistic: false,
    },
  },
  nitro: {
    storage: {
      // Adaptador de datos `local` (DATA_ADAPTER=local). Los scripts seed/reset usan la misma carpeta.
      [LOCAL_STORAGE_MOUNT]: { driver: 'fs', base: LOCAL_STORAGE_BASE },
    },
  },
  i18n: {
    // Sin prefijo: /r/<token> es el mismo enlace en los dos idiomas. El idioma inicial lo fija la
    // invitación (Fase 4) y el selector lo guarda en una cookie.
    strategy: 'no_prefix',
    defaultLocale: 'es',
    locales: [
      { code: 'es', language: 'es-ES', name: 'Español', file: 'es.json' },
      { code: 'ro', language: 'ro-RO', name: 'Română', file: 'ro.json' },
    ],
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'boda_locale',
      fallbackLocale: 'es',
    },
  },
})
