import { GAME_TARGET, type GameQuestion, type GameResult } from '#shared/schemas'
import { useAdapterConfig } from './adapters'
import { samePassword } from './adapters/auth/password'

/** Código de la URL del juego en desarrollo con `AUTH_ADAPTER=dev`: `/juego/demo`. */
const DEV_GAME_CODE = 'demo'
/** `GAME_CODE`: 24+ caracteres aleatorios aptos para URL. La URL es la única llave del juego. */
const GAME_CODE_FORMAT = /^[A-Za-z0-9_-]{24,}$/

// Propuesta inicial (borrador): se cambian aquí sin tocar nada más.
export const GAME_QUESTIONS: GameQuestion[] = [
  {
    id: 'primer-viaje',
    kind: 'free',
    section: 'Recuerdos compartidos',
    emoji: '✈️',
    text: '¿Cuál fue el destino de vuestro primer viaje juntos?',
  },
  {
    id: 'primera-cita',
    kind: 'free',
    section: 'Recuerdos compartidos',
    emoji: '📍',
    text: '¿Dónde fue vuestra primera cita?',
  },
  {
    id: 'os-conocisteis',
    kind: 'free',
    section: 'Recuerdos compartidos',
    emoji: '💘',
    text: '¿Dónde os conocisteis?',
  },
  {
    id: 'pedida',
    kind: 'free',
    section: 'Recuerdos compartidos',
    emoji: '💍',
    text: '¿Dónde fue la pedida?',
  },
  {
    id: 'pelicula-keko',
    kind: 'free',
    section: 'Sobre el otro',
    emoji: '🎬',
    text: '¿Cuál es la película favorita de Keko?',
  },
  {
    id: 'cancion-ro',
    kind: 'free',
    section: 'Sobre el otro',
    emoji: '🎵',
    text: '¿Qué canción canta Ro en la ducha (o en el coche) sin ninguna vergüenza?',
  },
  {
    id: 'quicio-keko',
    kind: 'free',
    section: 'Sobre el otro',
    emoji: '😤',
    text: '¿Qué es lo que más saca de quicio a Keko?',
  },
  {
    id: 'tarde-aeropuerto',
    kind: 'who',
    section: '¿Quién de los dos…?',
    emoji: '⏰',
    text: '¿Quién de los dos llega tarde al aeropuerto?',
  },
  {
    id: 'dormido-despegue',
    kind: 'who',
    section: '¿Quién de los dos…?',
    emoji: '🛌',
    text: '¿Quién se queda dormido antes de que despegue el avión?',
  },
  {
    id: 'primero-pista',
    kind: 'who',
    section: '¿Quién de los dos…?',
    emoji: '🪩',
    text: '¿Quién va a ser el primero en salir a la pista el 31 de julio?',
  },
]

/**
 * ¿Es este el código del juego? Sin un `GAME_CODE` válido el juego no existe (404 para cualquier
 * código). Solo en desarrollo con `AUTH_ADAPTER=dev` vale `demo`: con `password`, aunque sea en dev
 * (p. ej. con `dev:mobile` en la wifi), `demo` desvelaría la contraseña real.
 */
export function isGameCode(code: string, env: NodeJS.ProcessEnv = process.env): boolean {
  const configured = env.GAME_CODE?.trim() ?? ''
  if (GAME_CODE_FORMAT.test(configured)) return samePassword(code, configured)
  if (configured) console.warn('[juego] GAME_CODE no es válido (24+ caracteres A-Z a-z 0-9 _ -)')
  return import.meta.dev && useAdapterConfig().auth === 'dev' && code === DEV_GAME_CODE
}

/** Coincidencias según las preguntas del servidor: cada pregunta cuenta una vez como máximo. */
export function countGamePoints(results: GameResult[]): number {
  const byId = new Map(results.map((r) => [r.id, r]))
  return GAME_QUESTIONS.filter((q) => {
    const r = byId.get(q.id)
    if (!r) return false
    return q.kind === 'free' ? r.matched === true : !!r.picks && r.picks[0] === r.picks[1]
  }).length
}

export function hasGameWon(results: GameResult[]): boolean {
  return countGamePoints(results) >= GAME_TARGET
}
