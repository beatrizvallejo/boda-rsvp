// Selección de adaptadores por variable de entorno (ver la tabla de "Arquitectura" en CLAUDE.md).
// Se leen de `process.env` en tiempo de ejecución, no en el build.

export const DATA_ADAPTERS = ['local', 'kv'] as const
export const AUTH_ADAPTERS = ['dev', 'password'] as const
export const NOTIFIER_ADAPTERS = ['console', 'gmail'] as const

export interface AdapterConfig {
  data: (typeof DATA_ADAPTERS)[number]
  auth: (typeof AUTH_ADAPTERS)[number]
  notifier: (typeof NOTIFIER_ADAPTERS)[number]
}

function pick<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T | undefined,
  env: NodeJS.ProcessEnv,
): T {
  const raw = env[name]?.trim() || fallback
  if (raw === undefined) {
    throw new Error(`[adapters] Falta la variable de entorno ${name} (${allowed.join(' | ')})`)
  }
  if (!(allowed as readonly string[]).includes(raw)) {
    throw new Error(`[adapters] ${name}="${raw}" no es válido (${allowed.join(' | ')})`)
  }
  return raw as T
}

/**
 * Resuelve y valida la configuración. **Salvaguarda:** en producción (`isDev === false`) no hay valor
 * por defecto para `AUTH_ADAPTER`, y `dev` lanza un error: nunca hay acceso al panel sin login.
 */
export function resolveAdapterConfig(
  env: NodeJS.ProcessEnv = process.env,
  isDev: boolean = import.meta.dev,
): AdapterConfig {
  const auth = pick('AUTH_ADAPTER', AUTH_ADAPTERS, isDev ? 'dev' : undefined, env)
  if (auth === 'dev' && !isDev) {
    throw new Error(
      '[adapters] AUTH_ADAPTER=dev no está permitido en producción: daría acceso al panel sin login. ' +
        'Usa AUTH_ADAPTER=password.',
    )
  }
  return {
    data: pick('DATA_ADAPTER', DATA_ADAPTERS, isDev ? 'local' : undefined, env),
    auth,
    notifier: pick('NOTIFIER_ADAPTER', NOTIFIER_ADAPTERS, isDev ? 'console' : undefined, env),
  }
}
