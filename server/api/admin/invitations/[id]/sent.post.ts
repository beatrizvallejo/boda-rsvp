import { sendRecordSchema, type Invitation } from '#shared/schemas'
import { requireAdmin } from '../../../../utils/admin'
import { useDataAdapter } from '../../../../utils/adapters'
import { parseOrThrow, readJsonBody } from '../../../../utils/http'
import { findInvitationById } from '../../../../utils/invitations'

/** Registra que se ha pulsado "Enviar por WhatsApp". Es orientativo: no hay confirmación de entrega. */
export default defineEventHandler(async (event): Promise<Invitation> => {
  await requireAdmin(event)
  const { kind } = parseOrThrow(sendRecordSchema, await readJsonBody(event))
  const current = await findInvitationById(getRouterParam(event, 'id'))
  const now = new Date().toISOString()
  const updated: Invitation =
    kind === 'invitation'
      ? { ...current, invitedSentAt: now }
      : { ...current, reminderSentAt: now, reminderCount: current.reminderCount + 1 }
  await useDataAdapter().updateInvitation(updated)
  return updated
})
