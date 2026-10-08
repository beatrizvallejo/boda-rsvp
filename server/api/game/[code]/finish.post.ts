import { gameFinishSchema, type GameReward } from '#shared/schemas'
import { useAuthAdapter } from '../../../utils/adapters'
import { hasGameWon, isGameCode } from '../../../utils/game'
import { apiError, readValidatedJson } from '../../../utils/http'

/**
 * Final del juego: con el código secreto y los puntos necesarios, abre la sesión del panel y devuelve
 * la contraseña. Los puntos los cuenta el servidor con sus preguntas; la llave real es el código.
 */
export default defineEventHandler(async (event): Promise<GameReward> => {
  if (!isGameCode(getRouterParam(event, 'code') ?? '')) throw apiError(404, 'not_found')
  const { results } = await readValidatedJson(event, gameFinishSchema)
  if (!hasGameWon(results)) throw apiError(403, 'not_enough_points')
  return { password: await useAuthAdapter().loginFromGame(event) }
})
