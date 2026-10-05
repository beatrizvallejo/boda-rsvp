import type { MessageTemplate } from '#shared/schemas'
import { requireAdmin } from '../../../utils/admin'
import { useDataAdapter } from '../../../utils/adapters'

export default defineEventHandler(async (event): Promise<MessageTemplate[]> => {
  await requireAdmin(event)
  return useDataAdapter().listTemplates()
})
