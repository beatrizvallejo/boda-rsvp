// Utilidades del panel de los novios (sin estado de componente).

/** `$fetch` del panel: si la sesión caduca (401), la cierra y vuelve al login. */
export const adminFetch = $fetch.create({
  onResponseError({ response }) {
    if (response.status === 401) {
      useAdminSession().value = null
      navigateTo('/admin/login')
    }
  },
})

/** Tras un error de validación, lleva el foco (y el scroll) al primer campo marcado. */
export async function focusFirstError() {
  await nextTick()
  document.querySelector<HTMLElement>('.admin [aria-invalid="true"]')?.focus()
}
