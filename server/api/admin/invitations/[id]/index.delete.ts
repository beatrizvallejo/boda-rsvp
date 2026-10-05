import { requireAdmin } from '../../../../utils/admin'
import { useDataAdapter } from '../../../../utils/adapters'
import { apiError } from '../../../../utils/http'
import { findInvitationById } from '../../../../utils/invitations'

/** Borra la invitación y su respuesta. */
export default defineEventHandler(async (event) => {
  await requireAdmin(event)
  const { id } = await findInvitationById(getRouterParam(event, 'id'))
  const deleted = await useDataAdapter().deleteInvitation(id)
  if (!deleted) throw apiError(404, 'not_found')
  setResponseStatus(event, 204)
  return null
})
