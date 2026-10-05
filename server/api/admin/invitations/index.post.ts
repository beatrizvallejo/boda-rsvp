import { invitationCreateRequestSchema, type Invitation } from '#shared/schemas'
import { requireAdmin } from '../../../utils/admin'
import { useDataAdapter } from '../../../utils/adapters'
import { parseOrThrow, readJsonBody } from '../../../utils/http'
import { buildInvitation } from '../../../utils/invitations'

/** Alta de una invitación, o de varias a la vez (importación). Devuelve las invitaciones creadas. */
export default defineEventHandler(async (event): Promise<Invitation[]> => {
  await requireAdmin(event)
  const parsed = parseOrThrow(invitationCreateRequestSchema, await readJsonBody(event))
  const now = new Date()
  const invitations = (Array.isArray(parsed) ? parsed : [parsed]).map((input) =>
    buildInvitation(input, now),
  )
  await useDataAdapter().insertInvitations(invitations)
  setResponseStatus(event, 201)
  return invitations
})
