import type { AdminInvitation } from '#shared/schemas'
import { requireAdmin } from '../../../utils/admin'
import { listAdminInvitations } from '../../../utils/invitations'

export default defineEventHandler(async (event): Promise<AdminInvitation[]> => {
  await requireAdmin(event)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')
  return listAdminInvitations()
})
