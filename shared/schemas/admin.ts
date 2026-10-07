import { z } from 'zod'
import { invitationSchema } from './invitation'
import { rsvpSchema } from './rsvp'

/** Sesión del panel. `method` indica cómo se ha entrado: `dev` (sin login, solo en desarrollo) o `password`. */
export const adminSessionSchema = z.object({ method: z.enum(['dev', 'password']) })
export type AdminSession = z.infer<typeof adminSessionSchema>

/** `POST /api/auth/login`: contraseña compartida de los novios. */
export const loginSchema = z.strictObject({ password: z.string().min(1).max(200) })

/** Invitación tal como la ve el panel: con teléfono, token y su respuesta (o `null` si está pendiente). */
export const adminInvitationSchema = invitationSchema.extend({ rsvp: rsvpSchema.nullable() })
export type AdminInvitation = z.infer<typeof adminInvitationSchema>

const countsSchema = z.object({
  confirmed: z.int(),
  pending: z.int(),
})

/**
 * `GET /api/admin/stats` (métricas del brief). Cada invitación está confirmada o pendiente: no hay
 * respuesta "no".
 * - `people.pending` cuenta una persona por invitación pendiente (el acompañante y los niños aún no se
 *   conocen).
 * - Adultos = invitado + acompañante.
 */
export const statsSchema = z.object({
  invitations: countsSchema.extend({ total: z.int() }),
  people: countsSchema,
  adults: z.int(),
  children: z.int(),
  whatsapp: z.object({
    invitationsSent: z.int(),
    invitationsNotSent: z.int(),
    remindersSent: z.int(),
  }),
  /** Apuntados a la reserva conjunta de vuelos: invitaciones y personas (adultos + niños). */
  jointFlight: z.object({ invitations: z.int(), people: z.int() }),
})
export type Stats = z.infer<typeof statsSchema>
