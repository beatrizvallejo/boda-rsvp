import { findInvitationByToken, toPublicInvitationResponse } from '../../utils/invitations'
import { useDataAdapter } from '../../utils/adapters'

/** Datos del enlace personal: nombres precargados, respuesta previa y estado del plazo. */
export default defineEventHandler(async (event) => {
  const invitation = await findInvitationByToken(getRouterParam(event, 'token'))
  const rsvp = await useDataAdapter().getRsvp(invitation.id)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return toPublicInvitationResponse(invitation, rsvp)
})
