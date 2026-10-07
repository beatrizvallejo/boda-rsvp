import type { Stats } from '#shared/schemas'
import { requireAdmin } from '../../utils/admin'
import { listAdminInvitations } from '../../utils/invitations'
import { computeStats } from '#shared/stats'

export default defineEventHandler(async (event): Promise<Stats> => {
  await requireAdmin(event)
  return computeStats(await listAdminInvitations())
})
