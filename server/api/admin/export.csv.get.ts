import { EVENT_TIMEZONE } from '#shared/config'
import { invitationLink } from '#shared/whatsapp'
import { requireAdmin } from '../../utils/admin'
import { toCsv } from '../../utils/csv'
import { listAdminInvitations } from '../../utils/invitations'

const HEADER = [
  'etiqueta',
  'invitado',
  'idioma',
  'estado',
  'acompañante',
  'adultos',
  'niños',
  'email',
  'teléfono',
  'enlace',
  'invitación_enviada',
  'recordatorios',
  'respondido',
]

/** Fecha en hora de Rumanía, `AAAA-MM-DD` (se ordena bien en una hoja de cálculo). */
function day(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('sv-SE', { timeZone: EVENT_TIMEZONE }).format(new Date(iso))
}

/** Exportación completa: una fila por invitación. Sirve para el catering y como copia de seguridad. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const siteUrl = useRuntimeConfig(event).public.siteUrl
  const rows = (await listAdminInvitations()).map(({ rsvp, ...invitation }) => [
    invitation.label,
    rsvp?.guestName ?? invitation.guestName,
    invitation.locale,
    rsvp ? 'confirmado' : 'pendiente',
    rsvp?.companionName ?? '',
    rsvp ? (rsvp.companionName ? 2 : 1) : '',
    rsvp ? rsvp.children : '',
    rsvp?.email ?? '',
    invitation.phone ?? '',
    invitationLink(siteUrl, invitation.token),
    day(invitation.invitedSentAt),
    invitation.reminderCount,
    day(rsvp?.updatedAt),
  ])

  const filename = `boda-invitados-${day(new Date().toISOString())}.csv`
  setResponseHeaders(event, {
    'Content-Type': 'text/csv; charset=utf-8',
    'Content-Disposition': `attachment; filename="${filename}"`,
    'Cache-Control': 'private, no-store',
  })
  return toCsv([HEADER, ...rows])
})
