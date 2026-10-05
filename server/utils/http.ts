import type { H3Event } from 'h3'
import type { z } from 'zod'

/** Códigos de error estables del contrato (en `data.code`); el frontend traduce a partir de ellos. */
export type ApiErrorCode =
  | 'not_found'
  | 'deadline_closed'
  | 'validation'
  | 'rate_limited'
  | 'unauthorized'
  | 'payload_too_large'
  | 'length_required'
  | 'unsupported_media_type'

export function apiError(
  statusCode: number,
  code: ApiErrorCode,
  extra: Record<string, unknown> = {},
) {
  return createError({ statusCode, statusMessage: code, data: { code, ...extra } })
}

const MAX_BODY_BYTES = 64 * 1024

/**
 * Lee el cuerpo JSON con un límite de tamaño. No valida: ver `parseOrThrow`.
 * - Exige `Content-Type: application/json`: así ningún formulario de otro sitio puede lanzar una
 *   petición "simple" contra la API.
 * - Exige `Content-Length`: sin él (`Transfer-Encoding: chunked`) el cuerpo se leería entero antes de
 *   poder comprobar el límite. `fetch` lo envía siempre con un cuerpo de texto.
 */
export async function readJsonBody(event: H3Event): Promise<unknown> {
  const contentType = getRequestHeader(event, 'content-type') ?? ''
  if (!/^application\/json\s*(;|$)/i.test(contentType)) {
    throw apiError(415, 'unsupported_media_type')
  }
  const lengthHeader = getRequestHeader(event, 'content-length')
  if (lengthHeader === undefined) throw apiError(411, 'length_required')
  const length = Number(lengthHeader)
  if (!Number.isFinite(length) || length > MAX_BODY_BYTES) throw apiError(413, 'payload_too_large')
  const raw = await readRawBody(event, 'utf8')
  if (!raw) return undefined
  if (Buffer.byteLength(raw) > MAX_BODY_BYTES) throw apiError(413, 'payload_too_large')
  try {
    return JSON.parse(raw)
  } catch {
    throw apiError(422, 'validation', { issues: [{ path: [], message: 'JSON inválido' }] })
  }
}

/** Valida con Zod y responde 422 con la lista de errores por campo si no pasa. */
export function parseOrThrow<S extends z.ZodType>(schema: S, value: unknown): z.output<S> {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw apiError(422, 'validation', {
      issues: result.error.issues.map((issue) => ({
        path: issue.path.map(String),
        code: issue.code,
        message: issue.message,
      })),
    })
  }
  return result.data
}
