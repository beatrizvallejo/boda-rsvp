import type { Stay } from '#shared/schemas'
import { getStay } from '../utils/stay'

/** Alojamiento y traslados. Sin datos personales: solo lo que publican los novios. */
export default defineEventHandler((): Promise<Stay> => getStay())
