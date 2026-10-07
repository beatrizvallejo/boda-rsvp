import { z } from 'zod'
import { LOCALES } from '../config'
import { foldDiacritics } from '../text'

export const localeSchema = z.enum(LOCALES)
export type Locale = z.infer<typeof localeSchema>

export const isoDateSchema = z.iso.datetime({ offset: true })

/** Nombre de una persona: se recorta y se limita a 80 caracteres (admite diacríticos rumanos). */
export const personNameSchema = z.string().trim().min(1).max(80)

export const idSchema = z.uuid()

/** Caracteres aleatorios al final del enlace personal (36^6 ≈ 2.200 millones de combinaciones). */
export const TOKEN_CODE_LENGTH = 6

/**
 * Nombre en formato de URL: sin tildes ni diacríticos (ș→s, ț→t, ñ→n), en minúsculas y con guiones.
 * "Ștefan Țăranu" → "stefan-taranu".
 */
export function slugifyName(name: string): string {
  const slug = foldDiacritics(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  // Máximo 40 caracteres, cortando por palabras enteras
  const short = slug.length > 40 ? slug.slice(0, 41).replace(/-[^-]*$/, '') : slug
  return short || 'invitado'
}

/** Token del enlace personal `/r/<token>`: nombre del invitado + código aleatorio, p. ej. `ana-garcia-lopez-k7f3q2`. */
export const tokenSchema = z
  .string()
  .max(64)
  .regex(new RegExp(`^(?:[a-z0-9]+-)+[a-z0-9]{${TOKEN_CODE_LENGTH}}$`))
