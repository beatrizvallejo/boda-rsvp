import { findInvitationByToken, toPublicInvitationResponse } from '../../utils/invitations'
import { useDataAdapter } from '../../utils/adapters'
import { enforceRateLimit, RATE_LIMITS } from '../../utils/rate-limit'

/** Datos del enlace personal: nombres precargados, respuesta previa y estado del plazo. */
export default defineEventHandler(async (event) => {
  enforceRateLimit(event, RATE_LIMITS.rsvpRead)
  const invitation = await findInvitationByToken(getRouterParam(event, 'token'))
  const rsvp = await useDataAdapter().getRsvp(invitation.id)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return toPublicInvitationResponse(invitation, rsvp)
})
