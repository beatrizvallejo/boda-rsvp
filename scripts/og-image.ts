// pnpm og → genera public/og.jpg (previsualización de WhatsApp, 1200×630) a partir de la plantilla
// `app/pages/og.vue`. Necesita el servidor de desarrollo en marcha (`pnpm dev`); la URL se puede
// cambiar con OG_BASE_URL.
import { resolve } from 'node:path'
import { chromium } from '@playwright/test'

const base = process.env.OG_BASE_URL ?? 'http://localhost:3000'
const out = resolve(import.meta.dirname, '../public/og.jpg')

const browser = await chromium.launch()
try {
  // Sin animación: las fichas se pintan directamente con su texto final.
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    reducedMotion: 'reduce',
  })
  const response = await page.goto(`${base}/og`, { waitUntil: 'networkidle' })
  if (!response?.ok()) throw new Error(`${base}/og respondió ${response?.status()}`)
  await page.evaluate(async () => {
    await document.fonts.ready
    // Fuera las herramientas de desarrollo de Nuxt (la píldora flotante).
    document
      .querySelectorAll('[id^="nuxt-devtools"], nuxt-devtools-frame')
      .forEach((el) => el.remove())
  })
  await page.screenshot({ path: out, type: 'jpeg', quality: 88 })
  console.log(`Guardada ${out}`)
} finally {
  await browser.close()
}
