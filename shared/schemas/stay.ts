import { z } from 'zod'
import { isoDateSchema } from './common'

/**
 * Alojamiento y traslados (Fase 6d): lo editan los novios en el panel y lo ve el invitado en la web.
 * Cada parte se muestra cuando tiene contenido (lista o nota); mientras está vacía, sigue en
 * «Próximamente».
 */

const noteSchema = z.string().trim().max(280)
const notesSchema = z.object({ es: noteSchema, ro: noteSchema })
const shortNoteSchema = z.string().trim().max(140)

export const MAX_HOTELS = 6
export const MAX_BUSES = 6

/** Un alojamiento recomendado. El nombre es propio y no se traduce; la nota corta, sí. */
export const hotelSchema = z.strictObject({
  name: z.string().trim().min(1).max(80),
  /** Web o ficha del alojamiento (vacío = sin enlace). Solo `https://`. */
  url: z.union([z.literal(''), z.url({ protocol: /^https$/ }).max(500)]),
  /** Distancia al Roots en km (`null` = no se indica). */
  km: z.number().min(0).max(200).nullable(),
  note: z.object({ es: shortNoteSchema, ro: shortNoteSchema }),
})
export type Hotel = z.infer<typeof hotelSchema>

/**
 * Una salida de autobús el día de la boda: punto de salida y hora local de Rumanía (`HH:MM`). La
 * vuelta se añade como otra salida («Roots → Alba Iulia»).
 */
export const busSchema = z.strictObject({
  place: z.string().trim().min(1).max(80),
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
})
export type Bus = z.infer<typeof busSchema>

const stayFields = {
  hotels: z.array(hotelSchema).max(MAX_HOTELS),
  hotelsNote: notesSchema,
  buses: z.array(busSchema).max(MAX_BUSES),
  transfersNote: notesSchema,
}

export const staySchema = z.object({ ...stayFields, updatedAt: isoDateSchema })
export type Stay = z.infer<typeof staySchema>

/** `PUT /api/admin/stay` */
export const stayUpdateSchema = z.strictObject(stayFields)
export type StayUpdate = z.infer<typeof stayUpdateSchema>
