// Alojamiento y traslados (Fase 6d): valores iniciales y qué partes tienen contenido.
import type { Locale } from './schemas/common'
import type { Stay } from './schemas/stay'

/** Valores iniciales (sin documento guardado): todo vacío, así que se ve «Próximamente». */
export const DEFAULT_STAY: Stay = {
  hotels: [],
  hotelsNote: { es: '', ro: '' },
  buses: [],
  transfersNote: { es: '', ro: '' },
  updatedAt: '2026-10-08T00:00:00.000Z',
}

/** Cada parte se publica en cuanto tiene una lista o una nota en algún idioma. */
export function stayReady(stay: Stay) {
  return {
    hotels: stay.hotels.length > 0 || !!stay.hotelsNote.es || !!stay.hotelsNote.ro,
    transfers: stay.buses.length > 0 || !!stay.transfersNote.es || !!stay.transfersNote.ro,
  }
}

/** Nota en el idioma del invitado; si solo está en el otro idioma, esa (mejor que nada). */
export function pickNote(note: Record<Locale, string>, locale: string): string {
  const own = locale === 'ro' ? note.ro : note.es
  return own || note.es || note.ro
}
