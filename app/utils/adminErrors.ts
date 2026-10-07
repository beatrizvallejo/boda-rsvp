// Mensajes de validación del panel (solo en español: los formularios públicos usan i18n).
import type { z } from 'zod'

export interface FieldError {
  field: string
  message: string
}

export const INVITATION_MESSAGES: Record<string, string> = {
  guestName: 'Escribe el nombre del invitado (máx. 80 caracteres).',
  locale: 'Elige el idioma: ES o RO.',
  phone: 'Teléfono no válido: escríbelo con prefijo, p. ej. +34 600 111 222.',
  label: 'Etiqueta demasiado larga (máx. 80 caracteres).',
}

export const RSVP_MESSAGES: Record<string, string> = {
  guestName: 'Escribe el nombre del invitado.',
  companionName: 'Falta el nombre del acompañante (o marca «Solo/a»).',
  children: 'El número de niños va de 0 a 10.',
  email: 'Email no válido.',
}

/** Primer error de Zod como `{ campo, mensaje }`, con el mensaje del mapa correspondiente. */
export function firstFieldError(error: z.ZodError, messages: Record<string, string>): FieldError {
  const field = String(error.issues[0]?.path[0] ?? '')
  return { field, message: messages[field] ?? 'Revisa los datos.' }
}

export const FLIGHTS_MESSAGES: Record<string, string> = {
  status: 'Elige un estado.',
  openUntil: 'Con la reserva abierta, indica hasta qué día.',
  note: 'La nota no puede pasar de 280 caracteres.',
  lastPrice: 'Precio no válido: un número de euros (1–5000) y el día en que lo visteis.',
  outbound: 'Indica la fecha de ida.',
  inbound: 'La vuelta no puede ser antes que la ida.',
}
