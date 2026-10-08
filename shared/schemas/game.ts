import { z } from 'zod'

/**
 * Juego de preguntas de pareja que desvela la contraseña del panel. Vive en `/juego/<código>`: la URL
 * secreta es la llave; el juego, el envoltorio. Las preguntas viven en el servidor (`server/utils/game.ts`).
 */

/** Puntos (coincidencias) necesarios para desvelar la contraseña. */
export const GAME_TARGET = 7

export const GAME_PLAYERS = ['keko', 'ro'] as const
export const gamePlayerSchema = z.enum(GAME_PLAYERS)
export type GamePlayer = z.infer<typeof gamePlayerSchema>

/**
 * `free`: respuesta libre; al revelarlas, los novios deciden si coinciden.
 * `who`: «¿Quién de los dos…?», con botones Keko / Ro; se compara solo.
 */
export const gameQuestionKindSchema = z.enum(['free', 'who'])

export const gameQuestionSchema = z.object({
  id: z.string(),
  kind: gameQuestionKindSchema,
  section: z.string(),
  emoji: z.string(),
  text: z.string(),
})
export type GameQuestion = z.infer<typeof gameQuestionSchema>

/** `GET /api/game/[code]` */
export interface GameInfo {
  target: number
  questions: GameQuestion[]
}

/** Resultado de una pregunta: `matched` (libre, lo deciden ellos) o `picks` (quién, se compara). */
export const gameResultSchema = z.object({
  id: z.string().max(40),
  matched: z.boolean().optional(),
  picks: z.tuple([gamePlayerSchema, gamePlayerSchema]).optional(),
})
export type GameResult = z.infer<typeof gameResultSchema>

/** `POST /api/game/[code]/finish` */
export const gameFinishSchema = z.object({
  results: z.array(gameResultSchema).max(20),
})
export type GameFinish = z.infer<typeof gameFinishSchema>

export interface GameReward {
  /** Contraseña del panel. En desarrollo (`AUTH_ADAPTER=dev`) no existe: llega `null`. */
  password: string | null
}
