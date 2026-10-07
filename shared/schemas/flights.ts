import { z } from 'zod'
import { isoDateSchema } from './common'

/**
 * Estado de la reserva conjunta de vuelos (sección pública y pestaña «Vuelos» del panel):
 * - `soon`: aún no hay nada; se ve el banner de «Próximamente» y la tarjeta no pregunta.
 * - `watching`: los novios están mirando precios.
 * - `open`: reserva conjunta abierta hasta `openUntil`.
 * - `closed`: reserva hecha o cerrada.
 */
export const flightStatusSchema = z.enum(['soon', 'watching', 'open', 'closed'])
export type FlightStatus = z.infer<typeof flightStatusSchema>

const dayString = z.iso.date()
const noteSchema = z.string().trim().max(280)

const flightsFields = {
  status: flightStatusSchema,
  /** Fecha límite para apuntarse (solo con `open`). */
  openUntil: dayString.nullable(),
  /** Nota corta de los novios en cada idioma (vacía = sin nota). */
  note: z.object({ es: noteSchema, ro: noteSchema }),
  /** Último precio visto por persona, ida y vuelta, en euros. Orientativo. */
  lastPrice: z.object({ amount: z.int().min(1).max(5000), seenOn: dayString }).nullable(),
  /** Fechas de ida y vuelta para los enlaces de búsqueda. */
  outbound: dayString,
  inbound: dayString,
}

export const flightsSchema = z.object({ ...flightsFields, updatedAt: isoDateSchema })
export type Flights = z.infer<typeof flightsSchema>

/** `PUT /api/admin/flights` */
export const flightsUpdateSchema = z
  .strictObject(flightsFields)
  .refine((f) => f.inbound >= f.outbound, {
    path: ['inbound'],
    message: 'La vuelta no puede ser antes que la ida',
  })
  .refine((f) => f.status !== 'open' || f.openUntil !== null, {
    path: ['openUntil'],
    message: 'Con la reserva abierta, indica hasta cuándo',
  })
export type FlightsUpdate = z.infer<typeof flightsUpdateSchema>
