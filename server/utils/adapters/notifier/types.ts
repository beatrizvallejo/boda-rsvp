import type { Invitation, Rsvp, RsvpChange } from '#shared/schemas'

/** Aviso a los novios cuando un invitado responde (`new`) o edita su respuesta (`change`). */
export interface RsvpNotification {
  kind: 'new' | 'change'
  invitation: Pick<Invitation, 'id' | 'label' | 'locale'>
  rsvp: Rsvp
  /** Vacío en `new`. */
  changes: RsvpChange[]
  /** Email del invitado, si lo ha dado. Se usa como `replyTo`. */
  replyTo: string | null
}

/** `console` (imprime en el log) en desarrollo; `gmail` (nodemailer + SMTP) en la Fase 8. */
export interface NotifierAdapter {
  notifyRsvp(notification: RsvpNotification): Promise<void>
}
