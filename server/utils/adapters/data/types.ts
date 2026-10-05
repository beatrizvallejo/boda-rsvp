import type { Invitation, MessageKind, MessageTemplate, Rsvp } from '#shared/schemas'

/**
 * Persistencia. `local` (Nitro storage en `.data/`) en desarrollo; `supabase` en la Fase 8.
 * Los ids, tokens y fechas los genera el servidor antes de llamar al adaptador.
 */
export interface DataAdapter {
  listInvitations(): Promise<Invitation[]>
  getInvitation(id: string): Promise<Invitation | null>
  getInvitationByToken(token: string): Promise<Invitation | null>
  /** Inserta todas o ninguna. Falla si algún id o token ya existe. */
  insertInvitations(invitations: Invitation[]): Promise<void>
  /** Reemplaza la invitación completa (mismo id y token). */
  updateInvitation(invitation: Invitation): Promise<void>
  /** Borra la invitación y su respuesta. Devuelve `false` si no existía. */
  deleteInvitation(id: string): Promise<boolean>

  listRsvps(): Promise<Rsvp[]>
  getRsvp(invitationId: string): Promise<Rsvp | null>
  /** Crea o reemplaza la respuesta de una invitación (una por invitación). */
  saveRsvp(rsvp: Rsvp): Promise<void>

  listTemplates(): Promise<MessageTemplate[]>
  getTemplate(kind: MessageKind, locale: MessageTemplate['locale']): Promise<MessageTemplate | null>
  saveTemplate(template: MessageTemplate): Promise<void>
}
