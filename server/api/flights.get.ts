import type { Flights } from '#shared/schemas'
import { getFlights } from '../utils/flights'

/** Sección pública de vuelos. Sin datos personales: solo lo que publican los novios. */
export default defineEventHandler((): Promise<Flights> => getFlights())
