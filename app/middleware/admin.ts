import type { AdminSession } from '#shared/schemas'

/** Páginas del panel: sin sesión, al login. Los datos los protege además cada endpoint de `/api/admin/*`. */
export default defineNuxtRouteMiddleware(async () => {
  const session = useAdminSession()
  if (session.value) return
  try {
    session.value = await $fetch<AdminSession>('/api/admin/session')
  } catch {
    return navigateTo('/admin/login')
  }
})
