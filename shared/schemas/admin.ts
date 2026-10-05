import { z } from 'zod'
import { invitationSchema } from './invitation'
import { rsvpSchema } from './rsvp'

export const adminSessionSchema = z.object({ email: z.string() })
export type AdminSession = z.infer<typeof adminSessionSchema>

/** Invitación tal como la ve el panel: con teléfono, token y su respuesta (o `null` si está pendiente). */
export const adminInvitationSchema = invitationSchema.extend({ rsvp: rsvpSchema.nullable() })
export type AdminInvitation = z.infer<typeof adminInvitationSchema>

const countsSchema = z.object({
  attending: z.int(),
  declined: z.int(),
  pending: z.int(),
})

/**
 * `GET /api/admin/stats` (métricas del brief).
 * - `people.pending` cuenta los nombres de las invitaciones sin respuesta (sin acompañantes ni niños,
 *   que aún no se conocen).
 * - Adultos = nombres de la respuesta + acompañante.
 */
export const statsSchema = z.object({
  invitations: countsSchema.extend({ total: z.int() }),
  people: countsSchema,
  attendingAdults: z.int(),
  attendingChildren: z.int(),
  whatsapp: z.object({
    invitationsSent: z.int(),
    invitationsNotSent: z.int(),
    remindersSent: z.int(),
  }),
})
export type Stats = z.infer<typeof statsSchema>
