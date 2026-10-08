import { expect, test } from '@playwright/test'
import { expectMobileBasics } from './mobile'

// Alojamiento, traslados y aviso a confirmados (Fase 6d), con los datos de ejemplo (`pnpm seed`).
const HYDRATED = { waitUntil: 'networkidle' } as const
const EMPTY_NOTES = { es: '', ro: '' }

test.describe('alojamiento, traslados y aviso a confirmados', () => {
  test.beforeEach(async ({ page }) => {
    // Modifica los datos: se ejecuta una sola vez, en el proyecto móvil de referencia.
    test.skip(test.info().project.name !== 'android-360', 'Solo en android-360')
    // Sin intro: aquí interesa lo que hay debajo de la tarjeta.
    await page.addInitScript(() => sessionStorage.setItem('kr-intro-visto', '1'))
  })

  test('los novios publican alojamiento y traslados, y el invitado los ve', async ({
    page,
    request,
  }) => {
    const saved = await request.put('/api/admin/stay', {
      data: {
        hotels: [
          {
            name: 'Hotel de prueba',
            url: 'https://example.com/hotel',
            km: 4.5,
            note: { es: 'Código BODAKR', ro: 'Cod BODAKR' },
          },
        ],
        hotelsNote: EMPTY_NOTES,
        buses: [{ place: 'Alba Iulia, Piața Cetății', time: '12:15' }],
        transfersNote: { es: 'Habrá autobús de ida y vuelta.', ro: '' },
      },
    })
    expect(saved.ok()).toBe(true)

    // Enlace no seguro: el servidor lo rechaza
    const rejected = await request.put('/api/admin/stay', {
      data: {
        hotels: [{ name: 'X', url: 'javascript:alert(1)', km: null, note: EMPTY_NOTES }],
        hotelsNote: EMPTY_NOTES,
        buses: [],
        transfersNote: EMPTY_NOTES,
      },
    })
    expect(rejected.status()).toBe(422)

    await page.goto('/', HYDRATED)
    await expect(page.getByRole('heading', { name: 'Dónde dormir' })).toBeVisible()
    await expect(page.getByText('a 4,5 km del Roots')).toBeVisible()
    await expect(page.getByRole('link', { name: /^Ver Hotel de prueba/ })).toHaveAttribute(
      'href',
      'https://example.com/hotel',
    )
    await expect(page.getByRole('heading', { name: 'Cómo moverse' })).toBeVisible()
    await expect(page.getByText('12:15')).toBeVisible()
    await expectMobileBasics(page, 'alojamiento y traslados')

    // Vacío otra vez: vuelve «Próximamente» con alojamiento y traslados
    const cleared = await request.put('/api/admin/stay', {
      data: { hotels: [], hotelsNote: EMPTY_NOTES, buses: [], transfersNote: EMPTY_NOTES },
    })
    expect(cleared.ok()).toBe(true)
    await page.reload(HYDRATED)
    await expect(page.getByRole('heading', { name: 'Dónde dormir' })).toHaveCount(0)
    await expect(page.locator('#pronto')).toContainText('Alojamiento')
    await expect(page.locator('#pronto')).toContainText('Traslados')
  })

  test('el aviso a confirmados es un mensaje general con la web pública', async ({ page }) => {
    await page.goto('/admin?f=confirmed', HYDRATED)
    const card = page.getByRole('region', { name: /Aviso a confirmados/ })
    await expect(card).toBeVisible()
    const whatsapp = card.getByRole('link', { name: /WhatsApp · aviso en Español/ })
    const href = decodeURIComponent((await whatsapp.getAttribute('href')) ?? '')
    expect(href).toMatch(/^https:\/\/api\.whatsapp\.com\/send\/\?text=/)
    expect(href).not.toContain('/r/') // sin enlace personal
    expect(href).not.toContain('{nombre}')
    await expect(card.getByRole('link', { name: /WhatsApp · aviso en Română/ })).toBeVisible()
    await expectMobileBasics(page, 'panel · aviso a confirmados')
  })
})
