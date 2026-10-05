import { isRsvpClosed } from '#shared/config'
import { HONEYPOT_FIELD, rsvpInputSchema, type RsvpSaveResponse } from '#shared/schemas'
import { apiError, parseOrThrow, readJsonBody } from '../../utils/http'
import { findInvitationByToken, toPublicRsvp } from '../../utils/invitations'
import { enforceRateLimit, RATE_LIMITS } from '../../utils/rate-limit'
import { saveRsvp } from '../../utils/rsvp'

/**
 * Crea o edita la respuesta del enlace personal.
 * Orden: rate limit → honeypot → validación (Zod) → token → plazo → guardado → notificación.
 */
export default defineEventHandler(async (event): Promise<RsvpSaveResponse | null> => {
  enforceRateLimit(event, RATE_LIMITS.rsvpWrite)
  setResponseHeader(event, 'Cache-Control', 'private, no-store')

  const body = await readJsonBody(event)
  let input: unknown = body
  if (body && typeof body === 'object' && !Array.isArray(body) && HONEYPOT_FIELD in body) {
    const { [HONEYPOT_FIELD]: honeypot, ...rest } = body as Record<string, unknown>
    if (typeof honeypot !== 'string' || honeypot !== '') {
      // Éxito simulado: no se guarda nada y el bot no sabe que lo hemos detectado.
      console.warn('[rsvp] Honeypot relleno: petición descartada')
      setResponseStatus(event, 204)
      return null
    }
    input = rest
  }

  const data = parseOrThrow(rsvpInputSchema, input)
  const invitation = await findInvitationByToken(getRouterParam(event, 'token'))
  if (isRsvpClosed()) throw apiError(410, 'deadline_closed')

  const { rsvp, isNew, changes } = await saveRsvp(invitation, data, 'guest')
  return { rsvp: toPublicRsvp(rsvp), isNew, changes }
})
