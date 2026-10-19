// Datos fijos del evento compartidos por cliente y servidor (ver docs/brief.md).

export const EVENT_TIMEZONE = 'Europe/Bucharest'

export const LOCALES = ['es', 'ro'] as const

/**
 * Fecha límite de confirmación: lunes 1 de febrero de 2027, 23:59 en Rumanía.
 * En febrero Rumanía está en horario de invierno (EET, UTC+2), así que equivale a 21:59 UTC (se acepta todo el minuto 23:59).
 */
export const RSVP_DEADLINE = '2027-02-01T21:59:59.999Z'

export function isRsvpClosed(now: Date = new Date()): boolean {
  return now.getTime() > Date.parse(RSVP_DEADLINE)
}

/**
 * Inicio de la boda: sábado 31 de julio de 2027 a las 13:00 en Rumanía (EEST, UTC+3). Ceremonia y
 * celebración en el mismo lugar (ver `VENUE`). Se usa en la cuenta atrás y en el `.ics`.
 */
export const WEDDING_START = '2027-07-31T10:00:00.000Z'

/** Lugar de la boda (ver docs/brief.md). */
export const VENUE = {
  name: 'Roots Wedding Venue',
  mapsUrl: 'https://www.google.com/maps/place/Roots+Wedding+Venue/@46.1158452,23.4344662,15z',
  instagramUrl: 'https://www.instagram.com/roots_weddingvenue',
  lat: 46.1158452,
  lng: 23.4344662,
} as const

/**
 * Inicio decorativo del "trayecto" Madrid → Alba que muestra la portada (seguimiento del vuelo):
 * el avión avanza desde esta fecha hasta `WEDDING_START`. Ajustable sin efecto en los datos.
 */
export const JOURNEY_START = '2026-10-01T00:00:00.000Z'
