import { buildIcs } from '#shared/calendar'
import { localeSchema } from '#shared/schemas'

/**
 * Evento de la boda para el calendario (`/boda.ics?lang=es|ro`). Lo sirve el servidor, y no un blob
 * generado en el cliente, porque las descargas de blobs fallan en el navegador integrado de WhatsApp.
 */
export default defineEventHandler((event) => {
  const parsed = localeSchema.safeParse(getQuery(event).lang)
  const locale = parsed.success ? parsed.data : 'es'
  setResponseHeaders(event, {
    'Content-Type': 'text/calendar; charset=utf-8',
    'Content-Disposition': 'attachment; filename="boda-keko-y-ro.ics"',
    'Cache-Control': 'public, max-age=3600',
  })
  return buildIcs(locale)
})
