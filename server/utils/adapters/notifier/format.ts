import type { Rsvp, RsvpField } from '#shared/schemas'
import type { RsvpNotification } from './types'

// Texto plano del aviso a los novios (aprobado en la Fase 4). Lo usan `console` y, en la Fase 8, `gmail`.
// Siempre en español: lo leen los novios, no el invitado.

const FIELD_LABELS: Record<RsvpField, string> = {
  guestName: 'Pasajero',
  companionName: 'Acompañante',
  children: 'Menores',
  jointFlight: 'Vuelo conjunto',
}

const JOINT_FLIGHT_LABELS: Record<string, string> = {
  yes: 'Sí, desde Madrid',
  no: 'No',
}

function formatValue(value: unknown, field?: RsvpField): string {
  if (value === null || value === undefined || value === '') return '—'
  if (field === 'jointFlight') return JOINT_FLIGHT_LABELS[String(value)] ?? String(value)
  return String(value)
}

/** "2 adultos + 1 niño", "1 adulto". */
function formatPeople(rsvp: Rsvp): string {
  const adults = rsvp.companionName ? 2 : 1
  const people = `${adults} ${adults === 1 ? 'adulto' : 'adultos'}`
  if (rsvp.children === 0) return people
  return `${people} + ${rsvp.children} ${rsvp.children === 1 ? 'niño' : 'niños'}`
}

export function formatRsvpNotification(
  notification: RsvpNotification,
  siteUrl: string,
): { subject: string; text: string } {
  const { kind, invitation, rsvp, changes } = notification
  const subject =
    kind === 'new'
      ? `✈️ ${rsvp.guestName} confirma · ${formatPeople(rsvp)}`
      : `✏️ Cambio · ${rsvp.guestName}`

  const lines: string[] = []
  if (kind === 'new') {
    lines.push('¡Nuevo pasajero a bordo!', '')
  } else {
    lines.push('Qué ha cambiado:')
    for (const change of changes) {
      lines.push(
        `  · ${FIELD_LABELS[change.field]}: ${formatValue(change.from, change.field)} → ${formatValue(change.to, change.field)}`,
      )
    }
    lines.push('', `Respuesta actual (${formatPeople(rsvp)}):`)
  }

  const fields = [
    ...(Object.keys(FIELD_LABELS) as RsvpField[]).map(
      (field) => [FIELD_LABELS[field], formatValue(rsvp[field], field)] as const,
    ),
    ['Idioma', invitation.locale.toUpperCase()] as const,
  ]
  const width = Math.max(...fields.map(([label]) => label.length)) + 2
  for (const [label, value] of fields) lines.push(`${`${label}:`.padEnd(width)}${value}`)

  lines.push('', `Ver en el panel: ${siteUrl}/admin`)
  return { subject, text: lines.join('\n') }
}
