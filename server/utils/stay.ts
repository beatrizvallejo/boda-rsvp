import type { Stay } from '#shared/schemas'
import { DEFAULT_STAY } from '#shared/stay'
import { useDataAdapter } from './adapters'

/** Alojamiento y traslados guardados, o vacíos («Próximamente») si nunca se han guardado. */
export async function getStay(): Promise<Stay> {
  return (await useDataAdapter().getStay()) ?? DEFAULT_STAY
}
