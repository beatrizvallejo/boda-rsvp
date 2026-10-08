import { GAME_TARGET, type GameInfo } from '#shared/schemas'
import { GAME_QUESTIONS, isGameCode } from '../../../utils/game'
import { apiError } from '../../../utils/http'

/** Preguntas del juego. Solo con el código secreto; si no, 404 (como si no existiera). */
export default defineEventHandler((event): GameInfo => {
  if (!isGameCode(getRouterParam(event, 'code') ?? '')) throw apiError(404, 'not_found')
  return { target: GAME_TARGET, questions: GAME_QUESTIONS }
})
