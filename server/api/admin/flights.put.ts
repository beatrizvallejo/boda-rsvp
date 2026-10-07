import { flightsUpdateSchema, type Flights } from '#shared/schemas'
import { requireAdmin } from '../../utils/admin'
import { useDataAdapter } from '../../utils/adapters'
import { readValidatedJson } from '../../utils/http'

/** Los novios actualizan la sección de vuelos (estado, nota, último precio, fechas de búsqueda). */
export default defineEventHandler(async (event): Promise<Flights> => {
  await requireAdmin(event)
  const update = await readValidatedJson(event, flightsUpdateSchema)
  const flights: Flights = {
    ...update,
    // La fecha límite solo tiene sentido con la reserva abierta.
    openUntil: update.status === 'open' ? update.openUntil : null,
    updatedAt: new Date().toISOString(),
  }
  await useDataAdapter().saveFlights(flights)
  return flights
})
