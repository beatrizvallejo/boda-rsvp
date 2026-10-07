import type { H3Event } from 'h3'
import type { AdminSession } from '#shared/schemas'
import { useAuthAdapter } from './adapters'
import { apiError } from './http'

/**
 * Exige sesión de los novios. Lo llama cada endpoint de `/api/admin/*` (además del middleware),
 * para que ninguno dependa solo de que la página esté protegida.
 */
export async function requireAdmin(event: H3Event): Promise<AdminSession> {
  const cached = event.context.adminSession as AdminSession | undefined
  if (cached) return cached
  const session = await useAuthAdapter().getAdminSession(event)
  if (!session) throw apiError(401, 'unauthorized')
  event.context.adminSession = session
  return session
}
