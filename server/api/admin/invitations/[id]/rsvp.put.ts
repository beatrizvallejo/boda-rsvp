import { rsvpInputSchema, type Rsvp } from '#shared/schemas'
import { requireAdmin } from '../../../../utils/admin'
import { readValidatedJson } from '../../../../utils/http'
import { findInvitationById } from '../../../../utils/invitations'
import { saveRsvp } from '../../../../utils/rsvp'

/**
 * Los novios registran o corrigen una respuesta (p. ej. alguien confirma por teléfono).
 * Ignora la fecha límite y no genera aviso por email.
 */
export default defineEventHandler(async (event): Promise<Rsvp> => {
  await requireAdmin(event)
  const data = await readValidatedJson(event, rsvpInputSchema)
  const invitation = await findInvitationById(getRouterParam(event, 'id'))
  const { rsvp } = await saveRsvp(invitation, data, 'admin')
  return rsvp
})
