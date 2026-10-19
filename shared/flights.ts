// Vuelos a la boda (ver docs/brief.md): desde Madrid a Sibiu o Cluj, los aeropuertos con vuelo
// directo más cercanos a Alba. Sin APIs de precios: enlaces de búsqueda ya rellenos.
import type { Locale } from './schemas/common'
import type { Flights } from './schemas/flights'

export const FLIGHT_ORIGIN = { code: 'MAD', city: 'MADRID' } as const

export const FLIGHT_DESTINATIONS = [
  { code: 'SBZ', city: 'SIBIU', km: 70 },
  { code: 'CLJ', city: 'CLUJ', km: 100 },
] as const

/** Valores iniciales (sin documento guardado): «Próximamente» y las fechas del fin de semana. */
export const DEFAULT_FLIGHTS: Flights = {
  status: 'soon',
  openUntil: null,
  note: { es: '', ro: '' },
  lastPrice: null,
  outbound: '2027-07-30',
  inbound: '2027-08-02',
  updatedAt: '2026-10-07T00:00:00.000Z',
}

/** Búsqueda en Google Flights (no tiene API pública; el enlace con `q` sí funciona). */
export function googleFlightsUrl(to: string, outbound: string, inbound: string, lang: Locale) {
  const q = `Flights from ${FLIGHT_ORIGIN.code} to ${to} on ${outbound} through ${inbound}`
  return `https://www.google.com/travel/flights?q=${encodeURIComponent(q)}&hl=${lang}`
}

/** Búsqueda en Skyscanner: fechas en formato AAMMDD. */
export function skyscannerUrl(to: string, outbound: string, inbound: string, lang: Locale) {
  const day = (iso: string) => iso.slice(2).replaceAll('-', '')
  const host =
    lang === 'es'
      ? 'https://www.skyscanner.es/transport/vuelos'
      : 'https://www.skyscanner.net/transport/flights'
  return `${host}/${FLIGHT_ORIGIN.code.toLowerCase()}/${to.toLowerCase()}/${day(outbound)}/${day(inbound)}/`
}

/**
 * Búsqueda en Wizz Air, ida y vuelta para 1 adulto (`/adultos/niños/bebés/null`). El formato no está
 * documentado: es el de la propia web, comprobado el 19/10/2026. Vuela MAD → SBZ; MAD → CLJ sin
 * confirmar (si no hay vuelo ese día, la web ofrece el próximo disponible).
 */
export function wizzAirUrl(to: string, outbound: string, inbound: string, lang: Locale) {
  const site = lang === 'es' ? 'es-es' : 'ro-ro'
  return `https://wizzair.com/${site}/booking/select-flight/${FLIGHT_ORIGIN.code}/${to}/${outbound}/${inbound}/1/0/0/null`
}

/** Buscadores enlazados en cada ruta, en este orden. */
export const FLIGHT_SEARCHES = [
  { name: 'Google Flights', url: googleFlightsUrl },
  { name: 'Skyscanner', url: skyscannerUrl },
  { name: 'Wizz Air', url: wizzAirUrl },
] as const

/** Día de una fecha `AAAA-MM-DD` en el idioma del invitado: "15 de marzo" / "15 martie". */
export function formatFlightDay(day: string, locale: string, withYear = false): string {
  return new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    ...(withYear ? { year: 'numeric' } : {}),
    timeZone: 'UTC',
  }).format(new Date(`${day}T12:00:00Z`))
}
