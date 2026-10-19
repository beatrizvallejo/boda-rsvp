import { expect, test } from '@playwright/test'
import { expectMobileBasics } from './mobile'

// Flujo completo con los datos de ejemplo (`pnpm seed` en global-setup.ts): un invitado pendiente abre
// su enlace, confirma, vuelve y edita, y los novios lo ven en el panel (adaptador `auth: dev`).
const TOKEN = 'pablo-martinez-gil-demo07'
const GUEST = 'Pablo Martínez Gil'
// Espera a que Vue hidrate: un clic antes de la hidratación se pierde (sobre todo en `dev`).
const HYDRATED = { waitUntil: 'networkidle' } as const

test.describe('flujo completo', () => {
  test('abrir el enlace → confirmar → editar → verlo en el panel', async ({ page, request }) => {
    // Modifica los datos: se ejecuta una sola vez, en el proyecto móvil de referencia.
    test.skip(test.info().project.name !== 'android-360', 'Solo en android-360')

    // Los novios ponen en marcha la reserva conjunta de vuelos (con «Próximamente» no se pregunta)
    const flights = await request.put('/api/admin/flights', {
      data: {
        status: 'watching',
        openUntil: null,
        note: { es: 'Precio de prueba', ro: 'Preț de test' },
        lastPrice: null,
        outbound: '2027-07-30',
        inbound: '2027-08-02',
      },
    })
    expect(flights.ok()).toBe(true)

    // ── Enlace personal: intro ──────────────────────────────────────────
    await page.goto(`/r/${TOKEN}`, HYDRATED)
    const embark = page.getByRole('button', { name: 'Embarcar' })
    await expect(embark).toBeVisible()
    await expectMobileBasics(page, 'intro')
    await embark.click()
    await expect(embark).toBeHidden()

    // ── Tarjeta de embarque ─────────────────────────────────────────────
    const passenger = page.getByLabel('Pasajero')
    await expect(passenger).toHaveValue(GUEST)
    await expectMobileBasics(page, 'tarjeta')

    // Acompañante marcado sin nombre: error junto al campo y no se envía
    await page.getByRole('radio', { name: 'Con acompañante' }).click()
    await page.getByRole('button', { name: 'Confirmar asistencia' }).click()
    const companion = page.getByRole('textbox', { name: /^Acompañante/ })
    await expect(companion).toHaveAttribute('aria-invalid', 'true')
    await expect(page.getByText('Falta el nombre de tu acompañante')).toBeVisible()
    await expect(companion).toBeFocused()

    await companion.fill('Marta López')
    await page.getByRole('button', { name: 'Añadir un menor' }).click()
    // Cupón del vuelo conjunto, siempre visible con la reserva en marcha (solo Sí / No)
    await expect(page.getByText('Reserva conjunta · Opcional')).toBeVisible()
    await expect(page.getByRole('radio')).toHaveCount(4) // 2 del acompañante + Sí / No
    await page.getByRole('radio', { name: 'Sí', exact: true }).click()
    await page.getByRole('button', { name: 'Confirmar asistencia' }).click()

    // ── Pantalla de éxito ───────────────────────────────────────────────
    const success = page.getByRole('dialog')
    await expect(
      success.getByRole('heading', { name: '¡Has confirmado tu asistencia!' }),
    ).toBeVisible()
    await expect(success.getByRole('link', { name: 'Apple · Outlook' })).toHaveAttribute(
      'href',
      '/boda.ics?lang=es',
    )
    await expectMobileBasics(page, 'éxito')
    await success.getByRole('heading').click()
    await expect(success).toBeHidden()

    // ── Volver al enlace y editar ───────────────────────────────────────
    await page.reload(HYDRATED)
    await expect(page.getByRole('button', { name: 'Embarcar' })).toBeHidden() // intro ya vista
    const save = page.getByRole('button', { name: 'Guardar cambios' })
    await expect(save).toBeDisabled()
    await expect(page.getByRole('textbox', { name: /^Acompañante/ })).toHaveValue('Marta López')
    await page.getByRole('button', { name: 'Añadir un menor' }).click()
    await expect(save).toBeEnabled()
    await save.click()
    await expect(page.getByRole('heading', { name: '¡Tarjeta actualizada!' })).toBeVisible()

    // La API pública no expone el teléfono ni datos internos
    const publicJson = await (await request.get(`/api/rsvp/${TOKEN}`)).text()
    expect(publicJson).not.toContain('+34')
    expect(publicJson).not.toContain('"label"')

    // ── Panel de los novios ─────────────────────────────────────────────
    await page.goto(`/admin?q=${encodeURIComponent('Pablo Martínez')}`, HYDRATED)
    const row = page.getByRole('row').filter({ hasText: GUEST })
    await expect(row).toHaveCount(1)
    await expect(row.getByText('Confirmado')).toBeVisible()
    await expect(row).toContainText('2 adultos + 2 niños')
    await expect(row).toContainText('con Marta López')
    await expect(row).toContainText('vuelo conjunto')
    await expectMobileBasics(page, 'panel')

    // Sección pública de vuelos: panel de salidas con búsquedas ya rellenas
    await page.goto(`/r/${TOKEN}`, HYDRATED)
    const board = page.locator('#vuelos')
    await expect(board.getByRole('heading', { name: 'Vuelos' })).toBeVisible()
    await expect(board).toContainText('Precio de prueba')
    await expect(board.getByRole('link', { name: /Sibiu · Skyscanner/ })).toHaveAttribute(
      'href',
      'https://www.skyscanner.es/transport/vuelos/mad/sbz/270730/270802/',
    )
    await expectMobileBasics(page, 'vuelos')

    // Filtro «Vuelo conjunto»: aviso de vuelos por WhatsApp a los apuntados
    await page.goto('/admin?f=flight', HYDRATED)
    const flightRow = page.getByRole('row').filter({ hasText: GUEST })
    const notice = flightRow.getByRole('link', { name: /Aviso de vuelos/ })
    const noticeText = new URL((await notice.getAttribute('href'))!).searchParams.get('text') ?? ''
    expect(noticeText).toContain('Novedades del vuelo conjunto Madrid → Rumanía')

    // Pendientes: recordatorio por WhatsApp con el mensaje bien codificado (emojis incluidos)
    await page.goto('/admin?f=pending', HYDRATED)
    const reminder = page
      .getByRole('row')
      .filter({ hasText: 'Lucía Sánchez Moreno' })
      .getByRole('link', { name: /Recordatorio/ })
    const href = await reminder.getAttribute('href')
    expect(href).toMatch(/^https:\/\/api\.whatsapp\.com\/send\/\?phone=34633444555&text=/)
    const text = decodeURIComponent(new URL(href!).searchParams.get('text') ?? '')
    expect(text).toContain('¡Hola, Lucía Sánchez Moreno! Última llamada para embarcar ✈️')
    expect(text).toContain('/r/lucia-sanchez-moreno-demo09')
    expect(text).toContain('1 de febrero')
  })
})
