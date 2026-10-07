import { loginSchema } from '#shared/schemas'
import { useAuthAdapter } from '../../utils/adapters'
import { apiError, readValidatedJson } from '../../utils/http'

/** Entrada al panel con la contraseña compartida. Fuera de `/api/admin/*`: no exige sesión. */
export default defineEventHandler(async (event) => {
  const { password } = await readValidatedJson(event, loginSchema)
  const ok = await useAuthAdapter().login(event, password)
  if (!ok) throw apiError(401, 'unauthorized')
  setResponseStatus(event, 204)
  return null
})
