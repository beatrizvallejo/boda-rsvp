// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/eslint'],
  typescript: {
    strict: true,
  },
  eslint: {
    config: {
      // El formato lo lleva Prettier (eslint-config-prettier en eslint.config.mjs)
      stylistic: false,
    },
  },
})
