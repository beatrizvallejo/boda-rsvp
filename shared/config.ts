// Datos fijos del evento compartidos por cliente y servidor (ver docs/brief.md).

export const EVENT_TIMEZONE = 'Europe/Bucharest'

export const LOCALES = ['es', 'ro'] as const

/**
 * Fecha límite de confirmación: sábado 1 de mayo de 2027, 23:59 en Rumanía.
 * En mayo Rumanía está en horario de verano (EEST, UTC+3), así que equivale a 20:59 UTC (se acepta todo el minuto 23:59).
 */
export const RSVP_DEADLINE = '2027-05-01T20:59:59.999Z'

export function isRsvpClosed(now: Date = new Date()): boolean {
  return now.getTime() > Date.parse(RSVP_DEADLINE)
}
