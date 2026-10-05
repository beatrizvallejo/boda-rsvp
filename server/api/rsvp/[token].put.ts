import { isRsvpClosed } from '#shared/config'
import { rsvpInputSchema, type RsvpSaveResponse } from '#shared/schemas'
import { apiError, readValidatedJson } from '../../utils/http'
import { findInvitationByToken, toPublicRsvp } from '../../utils/invitations'
import { saveRsvp } from '../../utils/rsvp'

/**
 * Crea o edita la respuesta del enlace personal.
 * Orden: validación (Zod) → token → plazo → guardado → notificación.
 */
export default defineEventHandler(async (event): Promise<RsvpSaveResponse> => {
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  const data = await readValidatedJson(event, rsvpInputSchema)
  const invitation = await findInvitationByToken(getRouterParam(event, 'token'))
  if (isRsvpClosed()) throw apiError(410, 'deadline_closed')

  const { rsvp, isNew, changes } = await saveRsvp(invitation, data, 'guest')
  return { rsvp: toPublicRsvp(rsvp), isNew, changes }
})
