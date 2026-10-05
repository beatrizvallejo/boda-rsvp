import { useAdapterConfig, useAuthAdapter } from '../utils/adapters'

/**
 * Valida la configuración de adaptadores al arrancar. En producción con `AUTH_ADAPTER=dev` (o sin
 * `AUTH_ADAPTER`) lanza un error y el servidor no arranca: nunca hay acceso sin login en producción.
 */
export default defineNitroPlugin(() => {
  const config = useAdapterConfig()
  useAuthAdapter()
  console.info(
    `[adapters] data=${config.data} auth=${config.auth} notifier=${config.notifier}` +
      (import.meta.dev ? ' (desarrollo)' : ''),
  )
})
