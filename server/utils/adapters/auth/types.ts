import type { H3Event } from 'h3'
import type { AdminSession } from '#shared/schemas'

/**
 * Acceso al panel. `dev` (sin login, solo en desarrollo) o `password` (contraseña compartida de los
 * novios + cookie de sesión sellada).
 */
export interface AuthAdapter {
  /** La sesión si quien hace la petición es uno de los novios, o `null` si no lo es. */
  getAdminSession(event: H3Event): Promise<AdminSession | null>
  /** Comprueba la contraseña y, si es correcta, abre la sesión. Devuelve `false` si no lo es. */
  login(event: H3Event, password: string): Promise<boolean>
  /**
   * Premio del juego de preguntas (`/juego/<código>`), tras comprobar el código y los puntos: abre la
   * sesión y devuelve la contraseña para usarla en otros dispositivos (`null` si no hay contraseña).
   * No comprueba nada: solo lo llama `server/api/game/[code]/finish.post.ts`, tras `isGameCode` y
   * `hasGameWon`.
   */
  loginFromGame(event: H3Event): Promise<string | null>
  logout(event: H3Event): Promise<void>
}
