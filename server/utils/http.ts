import type { H3Event } from 'h3'
import type { z } from 'zod'

/** Códigos de error estables del contrato (en `data.code`); el frontend traduce a partir de ellos. */
export type ApiErrorCode =
  'not_found' | 'deadline_closed' | 'validation' | 'unauthorized' | 'not_enough_points'

export function apiError(
  statusCode: number,
  code: ApiErrorCode,
  extra: Record<string, unknown> = {},
) {
  return createError({ statusCode, statusMessage: code, data: { code, ...extra } })
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

/** Lee el cuerpo JSON y lo valida con `parseOrThrow`. Las longitudes máximas las fija el esquema. */
export async function readValidatedJson<S extends z.ZodType>(
  event: H3Event,
  schema: S,
): Promise<z.output<S>> {
  return parseOrThrow(schema, await readBody(event))
}
