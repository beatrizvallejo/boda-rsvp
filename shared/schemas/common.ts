import { z } from 'zod'
import { LOCALES } from '../config'

export const localeSchema = z.enum(LOCALES)

export const isoDateSchema = z.iso.datetime({ offset: true })

/** Nombre de una persona: se recorta y se limita a 80 caracteres (admite diacríticos rumanos). */
export const personNameSchema = z.string().trim().min(1).max(80)

export const guestNamesSchema = z.array(personNameSchema).min(1).max(8)

/** Texto libre opcional: una cadena vacía o solo con espacios se guarda como `null`. */
export function optionalTextSchema(max: number) {
  return z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
    z.string().trim().max(max).nullable(),
  )
}

export const idSchema = z.uuid()

/** 32 bytes aleatorios en base64url sin relleno: 43 caracteres, 256 bits. */
export const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/)
