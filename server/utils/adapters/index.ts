import { createDevAuthAdapter } from './auth/dev'
import type { AuthAdapter } from './auth/types'
import { resolveAdapterConfig, type AdapterConfig } from './config'
import { createLocalDataAdapter } from './data/local'
import type { DataAdapter } from './data/types'
import { createConsoleNotifierAdapter } from './notifier/console'
import type { NotifierAdapter } from './notifier/types'

let config: AdapterConfig | undefined
let data: DataAdapter | undefined
let auth: AuthAdapter | undefined
let notifier: NotifierAdapter | undefined

function notImplemented(kind: string, name: string): never {
  throw new Error(`[adapters] El adaptador ${kind}="${name}" se implementa en la Fase 8`)
}

/** Configuración validada (lanza si es inválida o insegura). La llama el plugin de arranque. */
export function useAdapterConfig(): AdapterConfig {
  config ??= resolveAdapterConfig()
  return config
}

export function useDataAdapter(): DataAdapter {
  if (!data) {
    const { data: name } = useAdapterConfig()
    data = name === 'local' ? createLocalDataAdapter() : notImplemented('DATA_ADAPTER', name)
  }
  return data
}

export function useAuthAdapter(): AuthAdapter {
  if (!auth) {
    const { auth: name } = useAdapterConfig()
    auth = name === 'dev' ? createDevAuthAdapter() : notImplemented('AUTH_ADAPTER', name)
  }
  return auth
}

export function useNotifierAdapter(): NotifierAdapter {
  if (!notifier) {
    const { notifier: name } = useAdapterConfig()
    notifier =
      name === 'console'
        ? createConsoleNotifierAdapter(useRuntimeConfig().public.siteUrl)
        : notImplemented('NOTIFIER_ADAPTER', name)
  }
  return notifier
}
