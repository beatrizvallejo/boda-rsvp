import type { AdminInvitation } from '#shared/schemas'
import { requireAdmin } from '../../../utils/admin'
import { listAdminInvitations } from '../../../utils/invitations'

export default defineEventHandler(async (event): Promise<AdminInvitation[]> => {
  await requireAdmin(event)
  return listAdminInvitations()
})
