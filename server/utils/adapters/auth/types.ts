import type { H3Event } from 'h3'
import type { AdminSession } from '#shared/schemas'

/**
 * Acceso al panel. `dev` (sin login, solo en desarrollo) o `password` (contraseña compartida de los novios + cookie de sesión firmada).
 * Devuelve la sesión si quien hace la petición es uno de los novios, o `null` si no lo es.
 */
export interface AuthAdapter {
  getAdminSession(event: H3Event): Promise<AdminSession | null>
}
