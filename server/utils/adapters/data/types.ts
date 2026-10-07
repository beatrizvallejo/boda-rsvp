import type { Flights, Invitation, MessageKind, MessageTemplate, Rsvp } from '#shared/schemas'

/**
 * Persistencia. `local` (Nitro storage, driver `fs` en `.data/`) en desarrollo; `kv` en producción: el mismo código con un driver KV del hosting (Fase 8).
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
  /** Borra la respuesta (la invitación vuelve a estar pendiente). Devuelve `false` si no había. */
  deleteRsvp(invitationId: string): Promise<boolean>

  listTemplates(): Promise<MessageTemplate[]>
  getTemplate(kind: MessageKind, locale: MessageTemplate['locale']): Promise<MessageTemplate | null>
  saveTemplate(template: MessageTemplate): Promise<void>

  /** Sección de vuelos; `null` si los novios aún no la han guardado nunca. */
  getFlights(): Promise<Flights | null>
  saveFlights(flights: Flights): Promise<void>
}
