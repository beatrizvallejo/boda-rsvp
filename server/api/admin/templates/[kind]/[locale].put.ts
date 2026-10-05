import { z } from 'zod'
import {
  localeSchema,
  messageKindSchema,
  templateUpdateSchema,
  type MessageTemplate,
} from '#shared/schemas'
import { requireAdmin } from '../../../../utils/admin'
import { useDataAdapter } from '../../../../utils/adapters'
import { apiError, readValidatedJson } from '../../../../utils/http'

const paramsSchema = z.object({ kind: messageKindSchema, locale: localeSchema })

export default defineEventHandler(async (event): Promise<MessageTemplate> => {
  await requireAdmin(event)
  const params = paramsSchema.safeParse(getRouterParams(event))
  if (!params.success) throw apiError(404, 'not_found')
  const { body } = await readValidatedJson(event, templateUpdateSchema)
  const template: MessageTemplate = { ...params.data, body, updatedAt: new Date().toISOString() }
  await useDataAdapter().saveTemplate(template)
  return template
})
