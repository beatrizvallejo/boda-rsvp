import type { Flights } from '#shared/schemas'
import { DEFAULT_FLIGHTS } from '#shared/flights'
import { useDataAdapter } from './adapters'

/** Sección de vuelos guardada, o los valores iniciales («Próximamente») si nunca se ha guardado. */
export async function getFlights(): Promise<Flights> {
  return (await useDataAdapter().getFlights()) ?? DEFAULT_FLIGHTS
}
