// https://nuxt.com/docs/api/configuration/nuxt-config
import { LOCAL_STORAGE_BASE, LOCAL_STORAGE_MOUNT } from './server/utils/adapters/data/local-keys'

// URL pública del sitio (metadatos Open Graph de WhatsApp y enlaces absolutos). En producción se fija
// con NUXT_PUBLIC_SITE_URL (ver docs/produccion.md).
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint', '@nuxtjs/i18n'],
  typescript: {
    strict: true,
  },
  css: ['~/assets/css/tokens.css', '~/assets/css/base.css'],
  runtimeConfig: {
    public: { siteUrl },
  },
  app: {
    head: {
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        // La fuente se precarga: aparece en la primera pantalla (intro)
        {
          rel: 'preload',
          href: '/fonts/archivo-latin.woff2',
          as: 'font',
          type: 'font/woff2',
          crossorigin: '',
        },
      ],
      meta: [{ name: 'theme-color', content: '#0e0f11' }],
    },
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
    baseUrl: siteUrl,
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
