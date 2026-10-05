import { invitationUpdateSchema, type Invitation } from '#shared/schemas'
import { requireAdmin } from '../../../../utils/admin'
import { useDataAdapter } from '../../../../utils/adapters'
import { readValidatedJson } from '../../../../utils/http'
import { findInvitationById } from '../../../../utils/invitations'

export default defineEventHandler(async (event): Promise<Invitation> => {
  await requireAdmin(event)
  const patch = await readValidatedJson(event, invitationUpdateSchema)
  const current = await findInvitationById(getRouterParam(event, 'id'))
  const updated: Invitation = { ...current, ...patch }
  await useDataAdapter().updateInvitation(updated)
  return updated
})
