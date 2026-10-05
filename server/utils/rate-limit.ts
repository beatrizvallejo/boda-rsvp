import type { H3Event } from 'h3'

// Rate limit en memoria, de ventana fija y por IP. Vale para desarrollo y un único proceso.
// En producción (serverless) el almacenamiento de los contadores lo decide devops: P04.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

export interface RateLimitRule {
  /** Nombre del límite, para separar contadores (p. ej. `rsvp-write`). */
  name: string
  max: number
  windowMs: number
}

export function enforceRateLimit(event: H3Event, rule: RateLimitRule): void {
  // Sin `xForwardedFor`: en local no hay proxy y la cabecera se podría falsificar.
  const ip = getRequestIP(event) ?? 'unknown'
  const key = `${rule.name}:${ip}`
  const now = Date.now()

  if (buckets.size > 10_000) {
    for (const [k, bucket] of buckets) if (bucket.resetAt <= now) buckets.delete(k)
  }

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + rule.windowMs })
    return
  }
  bucket.count++
  if (bucket.count > rule.max) {
    const retryAfter = Math.ceil((bucket.resetAt - now) / 1000)
    setResponseHeader(event, 'Retry-After', retryAfter)
    throw apiError(429, 'rate_limited', { retryAfter })
  }
}

export const RATE_LIMITS = {
  rsvpRead: { name: 'rsvp-read', max: 60, windowMs: 10 * 60_000 },
  rsvpWrite: { name: 'rsvp-write', max: 20, windowMs: 10 * 60_000 },
} satisfies Record<string, RateLimitRule>
