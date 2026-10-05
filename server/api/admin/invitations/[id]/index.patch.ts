import { invitationUpdateSchema, type Invitation } from '#shared/schemas'
import { requireAdmin } from '../../../../utils/admin'
import { useDataAdapter } from '../../../../utils/adapters'
import { parseOrThrow, readJsonBody } from '../../../../utils/http'
import { findInvitationById } from '../../../../utils/invitations'

export default defineEventHandler(async (event): Promise<Invitation> => {
  await requireAdmin(event)
  const patch = parseOrThrow(invitationUpdateSchema, await readJsonBody(event))
  const current = await findInvitationById(getRouterParam(event, 'id'))
  const updated: Invitation = { ...current, ...patch }
  await useDataAdapter().updateInvitation(updated)
  return updated
})
