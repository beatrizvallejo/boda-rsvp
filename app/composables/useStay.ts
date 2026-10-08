import type { Stay } from '#shared/schemas'
import { DEFAULT_STAY } from '#shared/stay'

/** Alojamiento y traslados (una sola petición por página). */
export function useStay() {
  return useFetch<Stay>('/api/stay', { key: 'stay', default: () => DEFAULT_STAY })
}
