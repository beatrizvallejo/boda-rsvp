import { z } from 'zod'
import { guestNamesSchema, isoDateSchema, localeSchema, tokenSchema } from './common'

/**
 * Teléfono en formato internacional E.164 (`+40712345678`). Se admiten espacios, guiones,
 * puntos y paréntesis al escribirlo, y se eliminan antes de validar.
 */
export const phoneSchema = z.preprocess(
  (value) => (typeof value === 'string' ? value.replace(/[\s\-().]/g, '') : value),
  z.string().regex(/^\+[1-9]\d{6,14}$/),
)

const nullablePhoneSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  phoneSchema.nullable(),
)

export const invitationLabelSchema = z.string().trim().min(1).max(80)

export const invitationSchema = z.object({
  id: z.uuid(),
  token: tokenSchema,
  label: invitationLabelSchema,
  guestNames: guestNamesSchema,
  locale: localeSchema,
  /** Solo lo ven los novios en el panel. Nunca sale por la API pública. */
  phone: phoneSchema.nullable(),
  invitedSentAt: isoDateSchema.nullable(),
  reminderSentAt: isoDateSchema.nullable(),
  reminderCount: z.int().min(0),
  createdAt: isoDateSchema,
})
export type Invitation = z.infer<typeof invitationSchema>

/** Alta de una invitación desde el panel (una a una o por importación). */
export const invitationCreateSchema = z.strictObject({
  label: invitationLabelSchema,
  guestNames: guestNamesSchema,
  locale: localeSchema.default('es'),
  phone: nullablePhoneSchema.default(null),
})
export type InvitationCreate = z.infer<typeof invitationCreateSchema>

/** `POST /api/admin/invitations` acepta una invitación o un array (importación). */
export const invitationCreateRequestSchema = z.union([
  invitationCreateSchema,
  z.array(invitationCreateSchema).min(1).max(500),
])

export const invitationUpdateSchema = z
  .strictObject({
    label: invitationLabelSchema,
    guestNames: guestNamesSchema,
    locale: localeSchema,
    phone: nullablePhoneSchema,
  })
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, { message: 'Sin cambios' })
export type InvitationUpdate = z.infer<typeof invitationUpdateSchema>

export const messageKindSchema = z.enum(['invitation', 'reminder'])
export type MessageKind = z.infer<typeof messageKindSchema>

/** `POST /api/admin/invitations/:id/sent`: registra que el novio ha pulsado "Enviar por WhatsApp". */
export const sendRecordSchema = z.strictObject({ kind: messageKindSchema })
