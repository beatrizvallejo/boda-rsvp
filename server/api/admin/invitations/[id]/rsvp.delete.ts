import { requireAdmin } from '../../../../utils/admin'
import { useDataAdapter } from '../../../../utils/adapters'
import { apiError } from '../../../../utils/http'
import { findInvitationById } from '../../../../utils/invitations'

/**
 * Quita la confirmación: alguien confirmó y luego avisa de que no puede ir. La invitación vuelve a
 * estar pendiente. No genera aviso por email.
 */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await findInvitationById(getRouterParam(event, 'id'))
  const deleted = await useDataAdapter().deleteRsvp(id)
  if (!deleted) throw apiError(404, 'not_found')
  setResponseStatus(event, 204)
  return null
})
