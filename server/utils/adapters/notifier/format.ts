import type { RsvpField } from '#shared/schemas'
import type { RsvpNotification } from './types'

// Texto plano del aviso a los novios. Lo usan `console` y, en la Fase 8, `gmail`.
// El texto definitivo se acuerda en la Fase 4.

const FIELD_LABELS: Record<RsvpField, string> = {
  guestName: 'Nombre',
  companionName: 'Acompañante',
  children: 'Niños',
  email: 'Email',
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'sí' : 'no'
  if (Array.isArray(value)) return value.join(', ')
  return String(value)
}

export function formatRsvpNotification(notification: RsvpNotification): {
  subject: string
  text: string
} {
  const { kind, invitation, rsvp, changes } = notification
  const subject =
    kind === 'new'
      ? `RSVP: ${invitation.label} confirma asistencia`
      : `Cambio en el RSVP: ${invitation.label}`

  const lines = [subject, '']
  if (kind === 'change') {
    lines.push('Qué ha cambiado:')
    for (const change of changes) {
      lines.push(
        `  · ${FIELD_LABELS[change.field]}: ${formatValue(change.from)} → ${formatValue(change.to)}`,
      )
    }
    lines.push('')
  }

  lines.push('Respuesta actual:')
  for (const field of Object.keys(FIELD_LABELS) as RsvpField[]) {
    lines.push(`  · ${FIELD_LABELS[field]}: ${formatValue(rsvp[field])}`)
  }
  lines.push('', `Idioma de la invitación: ${invitation.locale.toUpperCase()}`)
  return { subject, text: lines.join('\n') }
}
