// Mensajes de WhatsApp del panel (ver docs/whatsapp.md): plantillas con variables y enlaces de envío.
import { EVENT_TIMEZONE, RSVP_DEADLINE } from './config'
import type { Invitation } from './schemas'

/** Enlace personal absoluto de una invitación. */
export function invitationLink(siteUrl: string, token: string): string {
  return `${siteUrl.replace(/\/+$/, '')}/r/${token}`
}

/** Fecha límite en el idioma del invitado y en hora de Rumanía: "1 de mayo" / "1 mai". */
export function formatDeadline(locale: Invitation['locale']): string {
  return new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    timeZone: EVENT_TIMEZONE,
  }).format(new Date(RSVP_DEADLINE))
}

/** Sustituye `{nombre}`, `{enlace}` y `{fecha_limite}`. Las variables desconocidas se dejan tal cual. */
export function renderTemplate(
  body: string,
  vars: { nombre: string; enlace: string; fecha_limite: string },
): string {
  return body.replace(/\{(nombre|enlace|fecha_limite)\}/g, (_, key: keyof typeof vars) => vars[key])
}

/**
 * Enlace de WhatsApp con el mensaje codificado con `encodeURIComponent`. Con teléfono (E.164) abre el
 * chat de esa persona; sin él, WhatsApp pide elegir el contacto.
 *
 * Va directo a `api.whatsapp.com/send` y no a `wa.me`: la redirección de `wa.me` estropea algunos
 * emojis (`✈️` llegaba como `�`). Es el mismo destino al que redirige `wa.me`, sin ese paso.
 */
export function whatsappUrl(text: string, phone: string | null): string {
  const to = phone ? `phone=${phone.replace(/^\+/, '')}&` : ''
  return `https://api.whatsapp.com/send/?${to}text=${encodeURIComponent(text)}`
}
