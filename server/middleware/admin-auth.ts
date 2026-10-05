import { requireAdmin } from '../utils/admin'

/** Defensa en profundidad: toda ruta `/api/admin/*` exige sesión, aunque el handler lo olvide. */
export default defineEventHandler(async (event) => {
  const path = getRequestURL(event).pathname.toLowerCase()
  if (path === '/api/admin' || path.startsWith('/api/admin/')) await requireAdmin(event)
})
