import type { Invitation, Rsvp, RsvpChange, RsvpData, RsvpField } from '#shared/schemas'
import { useDataAdapter, useNotifierAdapter } from './adapters'

const COMPARED_FIELDS: RsvpField[] = ['guestName', 'companionName', 'children', 'email']

export function diffRsvp(previous: Rsvp | null, next: Rsvp): RsvpChange[] {
  if (!previous) return []
  return COMPARED_FIELDS.filter(
    (field) => JSON.stringify(previous[field]) !== JSON.stringify(next[field]),
  ).map((field) => ({ field, from: previous[field], to: next[field] }))
}

export interface SaveRsvpResult {
  rsvp: Rsvp
  isNew: boolean
  changes: RsvpChange[]
}

/**
 * Guarda la respuesta (ya validada y con el token resuelto) y, si la envía el invitado, avisa a los
 * novios. Orden: guardado → notificación. Un fallo del notifier se registra y nunca revierte el guardado.
 */
export async function saveRsvp(
  invitation: Invitation,
  data: RsvpData,
  updatedBy: Rsvp['updatedBy'],
): Promise<SaveRsvpResult> {
  const adapter = useDataAdapter()
  const previous = await adapter.getRsvp(invitation.id)
  const now = new Date().toISOString()
  const rsvp: Rsvp = {
    invitationId: invitation.id,
    ...data,
    updatedBy,
    createdAt: previous?.createdAt ?? now,
    updatedAt: now,
  }
  const changes = diffRsvp(previous, rsvp)
  const isNew = previous === null

  // Reenviar lo mismo no es un cambio: ni se reescribe ni se avisa.
  if (!isNew && changes.length === 0) return { rsvp: previous, isNew, changes }

  await adapter.saveRsvp(rsvp)

  // Los cambios que hacen los novios desde el panel no generan aviso: ya lo saben.
  if (updatedBy === 'guest') {
    try {
      await useNotifierAdapter().notifyRsvp({
        kind: isNew ? 'new' : 'change',
        invitation: { id: invitation.id, label: invitation.label, locale: invitation.locale },
        rsvp,
        changes,
        replyTo: rsvp.email,
      })
    } catch (error) {
      console.error(
        `[rsvp] Falló el aviso de la invitación ${invitation.id}; la respuesta está guardada`,
        error,
      )
    }
  }

  return { rsvp, isNew, changes }
}
