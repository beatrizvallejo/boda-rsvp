import { stayUpdateSchema, type Stay } from '#shared/schemas'
import { requireAdmin } from '../../utils/admin'
import { useDataAdapter } from '../../utils/adapters'
import { readValidatedJson } from '../../utils/http'

/** Los novios actualizan alojamiento y traslados (listas y notas). */
export default defineEventHandler(async (event): Promise<Stay> => {
  await requireAdmin(event)
  const update = await readValidatedJson(event, stayUpdateSchema)
  const stay: Stay = { ...update, updatedAt: new Date().toISOString() }
  await useDataAdapter().saveStay(stay)
  return stay
})
