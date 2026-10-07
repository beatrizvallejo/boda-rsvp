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
  logout(event: H3Event): Promise<void>
}
