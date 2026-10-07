// Datos y acciones del panel de los novios. Todo pasa por `/api/admin/*` (protegido por el adaptador
// `auth`); si la sesión caduca (401), se vuelve al login.
import type { AdminInvitation, MessageKind, MessageTemplate } from '#shared/schemas'
import { formatDeadline, invitationLink, renderTemplate, whatsappUrl } from '#shared/whatsapp'

export const adminFetch = $fetch.create({
  onResponseError({ response }) {
    if (response.status === 401) navigateTo('/admin/login')
  },
})

export function useAdminInvitations() {
  return useAsyncData(
    'admin-invitations',
    () => adminFetch<AdminInvitation[]>('/api/admin/invitations'),
    {
      default: () => [],
    },
  )
}

export function useAdminTemplates() {
  return useAsyncData(
    'admin-templates',
    () => adminFetch<MessageTemplate[]>('/api/admin/templates'),
    {
      default: () => [],
    },
  )
}

/**
 * URL pública para los enlaces personales. En desarrollo se usa la del navegador, para que los enlaces
 * funcionen al probar con `dev:mobile` desde la IP local.
 */
export function useSiteUrl(): string {
  return import.meta.dev && import.meta.client
    ? window.location.origin
    : useRuntimeConfig().public.siteUrl
}

/** Mensajes de WhatsApp, compartir, copiar y registro de envíos de una invitación. */
export function useSend() {
  const siteUrl = useSiteUrl()
  const { data: templates } = useAdminTemplates()
  const { refresh } = useAdminInvitations()
  const canShare = import.meta.client && typeof navigator.share === 'function'

  function link(invitation: Pick<AdminInvitation, 'token'>) {
    return invitationLink(siteUrl, invitation.token)
  }

  function message(invitation: AdminInvitation, kind: MessageKind): string {
    const template = templates.value.find((t) => t.kind === kind && t.locale === invitation.locale)
    return renderTemplate(template?.body ?? '{enlace}', {
      nombre: invitation.guestName,
      enlace: link(invitation),
      fecha_limite: formatDeadline(invitation.locale),
    })
  }

  function whatsapp(invitation: AdminInvitation, kind: MessageKind): string {
    return whatsappUrl(message(invitation, kind), invitation.phone)
  }

  /** Registro orientativo: se marca al pulsar, sin confirmación real de entrega. */
  async function record(invitation: AdminInvitation, kind: MessageKind) {
    await adminFetch(`/api/admin/invitations/${invitation.id}/sent`, {
      method: 'POST',
      body: { kind },
    })
    await refresh()
  }

  async function share(invitation: AdminInvitation, kind: MessageKind) {
    try {
      await navigator.share({ text: message(invitation, kind) })
    } catch {
      return // cancelado por el usuario
    }
    await record(invitation, kind)
  }

  async function copyLink(invitation: AdminInvitation): Promise<boolean> {
    try {
      await navigator.clipboard.writeText(link(invitation))
      return true
    } catch {
      return false
    }
  }

  return { canShare, link, message, whatsapp, record, share, copyLink }
}

/** Aviso breve tras una acción ("Enlace copiado"). Lo pinta `<AdminToast>`. */
export function useToast() {
  const message = useState<string>('admin-toast', () => '')
  let timer: ReturnType<typeof setTimeout> | undefined
  function show(text: string) {
    message.value = text
    clearTimeout(timer)
    timer = setTimeout(() => (message.value = ''), 2500)
  }
  return { message, show }
}

/** Tras un error de validación, lleva el foco (y el scroll) al primer campo marcado. */
export async function focusFirstError() {
  await nextTick()
  document.querySelector<HTMLElement>('.admin [aria-invalid="true"]')?.focus()
}
