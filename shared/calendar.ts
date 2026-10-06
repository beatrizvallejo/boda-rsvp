// Evento de calendario de la boda: `.ics` (ruta /boda.ics) y enlace de Google Calendar.
// Horas locales de Rumanía con TZID=Europe/Bucharest, nunca horas "flotantes".
import type { LOCALES } from './config'
import { EVENT_TIMEZONE, VENUE } from './config'

type Locale = (typeof LOCALES)[number]

/** 13:00 del 31/07/2027 hasta las 03:00 del día siguiente ("hasta que el cuerpo aguante"), hora de Rumanía. */
const LOCAL_START = '20270731T130000'
const LOCAL_END = '20270801T030000'

const TEXT: Record<Locale, { title: string; details: string }> = {
  es: {
    title: 'Boda de Keko y Ro ✈️',
    details: 'Apertura 13:00 (hora de Rumanía) · Cierre: hasta que el cuerpo aguante 🕺',
  },
  ro: {
    title: 'Nunta lui Keko și Ro ✈️',
    details: 'Deschidere 13:00 (ora României) · Închidere: până nu mai putem 🕺',
  },
}

const LOCATION = `${VENUE.name}, Alba, România`

export function googleCalendarUrl(locale: Locale): string {
  const { title, details } = TEXT[locale]
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${LOCAL_START}/${LOCAL_END}`,
    ctz: EVENT_TIMEZONE,
    location: LOCATION,
    details: `${details}\n${VENUE.mapsUrl}`,
  })
  return `https://calendar.google.com/calendar/render?${params}`
}

/** Escapa un valor de texto de iCalendar (RFC 5545 §3.3.11). */
function escapeText(value: string): string {
  return value.replace(/[\\;,]/g, (c) => `\\${c}`).replace(/\n/g, '\\n')
}

/** Pliega las líneas a 75 octetos (RFC 5545 §3.1), sin partir caracteres multibyte. */
function fold(line: string): string {
  const encoder = new TextEncoder()
  const parts: string[] = []
  let current = ''
  for (const char of line) {
    const limit = parts.length === 0 ? 75 : 74
    if (encoder.encode(current + char).length > limit) {
      parts.push(current)
      current = char
    } else {
      current += char
    }
  }
  parts.push(current)
  return parts.join('\r\n ')
}

export function buildIcs(locale: Locale): string {
  const { title, details } = TEXT[locale]
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Keko y Ro//Boda//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    // Rumanía: EET (UTC+2) en invierno y EEST (UTC+3) en verano
    'BEGIN:VTIMEZONE',
    `TZID:${EVENT_TIMEZONE}`,
    'BEGIN:DAYLIGHT',
    'TZOFFSETFROM:+0200',
    'TZOFFSETTO:+0300',
    'TZNAME:EEST',
    'DTSTART:19970330T030000',
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0300',
    'TZOFFSETTO:+0200',
    'TZNAME:EET',
    'DTSTART:19971026T040000',
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    'UID:boda-keko-ro-20270731@kekoyro',
    'DTSTAMP:20261006T000000Z',
    `DTSTART;TZID=${EVENT_TIMEZONE}:${LOCAL_START}`,
    `DTEND;TZID=${EVENT_TIMEZONE}:${LOCAL_END}`,
    `SUMMARY:${escapeText(title)}`,
    `LOCATION:${escapeText(LOCATION)}`,
    `GEO:${VENUE.lat};${VENUE.lng}`,
    `DESCRIPTION:${escapeText(`${details}\n${VENUE.mapsUrl}`)}`,
    `URL:${VENUE.mapsUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
