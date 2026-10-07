import type { Flights } from '#shared/schemas'
import { DEFAULT_FLIGHTS } from '#shared/flights'

/** Sección pública de vuelos (una sola petición por página: la comparten la portada y la tarjeta). */
export function useFlights() {
  return useFetch<Flights>('/api/flights', { key: 'flights', default: () => DEFAULT_FLIGHTS })
}
