import { z } from 'zod'
import { LOCALES } from '../config'

export const localeSchema = z.enum(LOCALES)

export const isoDateSchema = z.iso.datetime({ offset: true })

// Caracteres de control (incluidos saltos de línea) y controles bidireccionales: permitirían falsear
// líneas en el aviso de texto plano, en el log o en el CSV.
const CONTROL_CHARS = /[\p{Cc}\u200E\u200F\u202A-\u202E\u2066-\u2069]/u
const CONTROL_CHARS_EXCEPT_NEWLINE = /[^\P{Cc}\n]|[\u200E\u200F\u202A-\u202E\u2066-\u2069]/u

/** Nombre de una persona: se recorta y se limita a 80 caracteres (admite diacríticos rumanos). */
export const personNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(80)
  .refine((value) => !CONTROL_CHARS.test(value), { message: 'Caracteres no permitidos' })

export const guestNamesSchema = z.array(personNameSchema).min(1).max(8)

/** Texto libre opcional: una cadena vacía o solo con espacios se guarda como `null`. */
export function optionalTextSchema(max: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z
      .string()
      .trim()
      .max(max)
      .refine((value) => !CONTROL_CHARS_EXCEPT_NEWLINE.test(value.replace(/\r\n/g, '\n')), {
        message: 'Caracteres no permitidos',
      })
      .transform((value) => value.replace(/\r\n/g, '\n'))
      .nullable(),
  )
}

export const idSchema = z.uuid()

/** 32 bytes aleatorios en base64url sin relleno: 43 caracteres, 256 bits. */
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)
