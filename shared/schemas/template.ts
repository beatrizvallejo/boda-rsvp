import { z } from 'zod'
import { isoDateSchema, localeSchema } from './common'
import { messageKindSchema } from './invitation'

/** Variables que admiten las plantillas de WhatsApp (ver docs/whatsapp.md). */
export const TEMPLATE_VARIABLES = ['{nombre}', '{enlace}', '{fecha_limite}'] as const

export const templateBodySchema = z
  .string()
  .trim()
  .min(1)
  .max(1000)
  .refine((body) => body.includes('{enlace}'), {
    message: 'La plantilla debe incluir {enlace}',
  })

export const messageTemplateSchema = z.object({
  kind: messageKindSchema,
  locale: localeSchema,
  body: templateBodySchema,
  updatedAt: isoDateSchema,
})
export type MessageTemplate = z.infer<typeof messageTemplateSchema>

/** `PUT /api/admin/templates/:kind/:locale` */
export const templateUpdateSchema = z.strictObject({ body: templateBodySchema })
