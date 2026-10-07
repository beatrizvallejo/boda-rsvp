// Formatos del panel (en español y en hora de Rumanía, como el resto de horas del evento).
import { EVENT_TIMEZONE } from '#shared/config'
import type { Rsvp } from '#shared/schemas'

const dayFormat = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  timeZone: EVENT_TIMEZONE,
})
const dateTimeFormat = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: EVENT_TIMEZONE,
})

/** "2 nov" */
export function formatDay(iso: string): string {
  return dayFormat.format(new Date(iso))
}

/** "2 nov 2026, 20:30" (hora de Rumanía) */
export function formatDateTime(iso: string): string {
  return dateTimeFormat.format(new Date(iso))
}

export function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`
}

/** "2 adultos + 1 niño" */
export function formatPeople(rsvp: Pick<Rsvp, 'companionName' | 'children'>): string {
  const adults = plural(rsvp.companionName ? 2 : 1, 'adulto', 'adultos')
  return rsvp.children ? `${adults} + ${plural(rsvp.children, 'niño', 'niños')}` : adults
}
