import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import type { AuthAdapter } from './types'

const SESSION_NAME = 'boda_panel'
/** La sesión dura 30 días: los novios no tienen que entrar cada vez desde el móvil. */
const SESSION_MAX_AGE = 60 * 60 * 24 * 30
const MIN_ADMIN_PASSWORD = 16
const MIN_SESSION_PASSWORD = 32

interface PanelSession {
  admin?: true
}

/** Compara en tiempo constante: los dos lados se resumen con SHA-256 para igualar longitudes. */
export function samePassword(given: string, expected: string): boolean {
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

/**
 * Contraseña compartida de los novios (`ADMIN_PASSWORD`) y cookie de sesión sellada con `useSession`
 * de h3 (`NUXT_SESSION_PASSWORD`). Funciona igual en local y en producción, sin servicios externos.
 * Lanza al crearse si falta alguna variable, así que el servidor no arranca mal configurado.
 */
export function createPasswordAuthAdapter(env: NodeJS.ProcessEnv = process.env): AuthAdapter {
  const adminPassword = env.ADMIN_PASSWORD ?? ''
  const sessionPassword = env.NUXT_SESSION_PASSWORD ?? ''
  if (adminPassword.length < MIN_ADMIN_PASSWORD) {
    throw new Error(
      `[adapters] AUTH_ADAPTER=password necesita ADMIN_PASSWORD (${MIN_ADMIN_PASSWORD}+ caracteres)`,
    )
  }
  if (sessionPassword.length < MIN_SESSION_PASSWORD) {
    throw new Error(
      `[adapters] AUTH_ADAPTER=password necesita NUXT_SESSION_PASSWORD (${MIN_SESSION_PASSWORD}+ caracteres aleatorios)`,
    )
  }

  const session = (event: H3Event) =>
    useSession<PanelSession>(event, {
      name: SESSION_NAME,
      password: sessionPassword,
      maxAge: SESSION_MAX_AGE,
      // Sin cabecera alternativa: la sesión solo viaja en la cookie.
      sessionHeader: false,
      cookie: {
        httpOnly: true,
        // En `dev` (http://localhost o la IP local) el navegador no guardaría una cookie `Secure`.
        secure: !import.meta.dev,
        sameSite: 'lax',
        path: '/',
      },
    })

  return {
    async getAdminSession(event) {
      const { data } = await session(event)
      return data.admin ? { method: 'password' } : null
    },
    async login(event, password) {
      if (!samePassword(password, adminPassword)) return false
      await (await session(event)).update({ admin: true })
      return true
    },
    async loginFromGame(event) {
      await (await session(event)).update({ admin: true })
      return adminPassword
    },
    async logout(event) {
      await (await session(event)).clear()
    },
  }
}
