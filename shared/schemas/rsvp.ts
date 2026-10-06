import { z } from 'zod'
import { isoDateSchema, personNameSchema } from './common'
import { invitationSchema } from './invitation'

const nullableEmailSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.email().trim().max(254).nullable(),
)

/**
 * Lo que envía el invitado (o los novios desde el panel). Mismo esquema en cliente y servidor.
 * Solo se confirma asistencia: quien no viene no responde (ver docs/brief.md).
 */
export const rsvpInputSchema = z.strictObject({
  guestName: personNameSchema,
  /** `null` = sin acompañante. Si se marca acompañante, el nombre es obligatorio. */
  companionName: personNameSchema.nullable().default(null),
  children: z.int().min(0).max(10).default(0),
  email: nullableEmailSchema.default(null),
})
export type RsvpInput = z.input<typeof rsvpInputSchema>
export type RsvpData = z.output<typeof rsvpInputSchema>

export const rsvpSchema = z.object({
  invitationId: z.uuid(),
  guestName: personNameSchema,
  companionName: personNameSchema.nullable(),
  children: z.int().min(0).max(10),
  email: z.email().max(254).nullable(),
  /** Quién hizo el último cambio: el invitado desde su enlace o los novios desde el panel. */
  updatedBy: z.enum(['guest', 'admin']),
  createdAt: isoDateSchema,
  updatedAt: isoDateSchema,
})
export type Rsvp = z.infer<typeof rsvpSchema>

export const rsvpFieldSchema = z.enum(['guestName', 'companionName', 'children', 'email'])
export type RsvpField = z.infer<typeof rsvpFieldSchema>

export const rsvpChangeSchema = z.object({
  field: rsvpFieldSchema,
  from: z.unknown(),
  to: z.unknown(),
})
export type RsvpChange = z.infer<typeof rsvpChangeSchema>

/** Respuesta tal como la ve el invitado: sin datos internos. */
export const publicRsvpSchema = rsvpSchema.omit({ invitationId: true, updatedBy: true })
export type PublicRsvp = z.infer<typeof publicRsvpSchema>

/**
 * `GET /api/rsvp/:token`. Nunca incluye el teléfono, el id, el registro de envíos ni `label`
 * (etiqueta interna de los novios).
 */
export const publicInvitationResponseSchema = z.object({
  invitation: invitationSchema.pick({ guestName: true, locale: true }),
  rsvp: publicRsvpSchema.nullable(),
  deadline: isoDateSchema,
  closed: z.boolean(),
})
export type PublicInvitationResponse = z.infer<typeof publicInvitationResponseSchema>

/** `PUT /api/rsvp/:token`. `changes` está vacío en la primera respuesta. */
export const rsvpSaveResponseSchema = z.object({
  rsvp: publicRsvpSchema,
  isNew: z.boolean(),
  changes: z.array(rsvpChangeSchema),
})
export type RsvpSaveResponse = z.infer<typeof rsvpSaveResponseSchema>
