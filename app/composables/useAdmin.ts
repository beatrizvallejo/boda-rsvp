// Datos y acciones del panel de los novios. Todo pasa por `/api/admin/*` (protegido por el adaptador
// `auth`) con `adminFetch`, que vuelve al login si la sesión caduca.
import type { AdminInvitation, AdminSession, MessageKind, MessageTemplate } from '#shared/schemas'
import { formatDeadline, invitationLink, renderTemplate, whatsappUrl } from '#shared/whatsapp'

const INVITATIONS_KEY = 'admin-invitations'
const TEMPLATES_KEY = 'admin-templates'

/** Sesión del panel (`null` sin sesión). La rellena el middleware `admin` o el login. */
export function useAdminSession() {
  return useState<AdminSession | null>('admin-session', () => null)
}

// `dedupe: 'defer'`: si la petición ya está en marcha, quien llega después espera a esa misma en
// lugar de cancelarla y lanzar otra.
export function useAdminInvitations() {
  return useAsyncData(
    INVITATIONS_KEY,
    () => adminFetch<AdminInvitation[]>('/api/admin/invitations'),
    {
      default: () => [],
      dedupe: 'defer',
    },
  )
}

export function useAdminTemplates() {
  return useAsyncData(TEMPLATES_KEY, () => adminFetch<MessageTemplate[]>('/api/admin/templates'), {
    default: () => [],
    dedupe: 'defer',
  })
}

/** Etiquetas en uso (sin vacías ni repetidas), ordenadas: filtro del listado y sugerencias. */
export function useAdminLabels() {
  const { data } = useNuxtData<AdminInvitation[]>(INVITATIONS_KEY)
  return computed(() =>
    [...new Set((data.value ?? []).map((i) => i.label).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b, 'es'),
    ),
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

/**
 * Mensajes de WhatsApp, compartir, copiar y registro de envíos de una invitación. Lee las plantillas
 * que ya ha cargado la página (`useAdminTemplates`) sin volver a pedirlas: se usa en cada fila.
 */
export function useSend() {
  const siteUrl = useSiteUrl()
  const { data: templates } = useNuxtData<MessageTemplate[]>(TEMPLATES_KEY)
  const canShare = import.meta.client && typeof navigator.share === 'function'

  function link(invitation: Pick<AdminInvitation, 'token'>) {
    return invitationLink(siteUrl, invitation.token)
  }

  function message(invitation: AdminInvitation, kind: MessageKind): string {
    const template = templates.value?.find((t) => t.kind === kind && t.locale === invitation.locale)
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
    await refreshNuxtData(INVITATIONS_KEY)
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

// Un único temporizador para todo el panel: un aviso nuevo no lo borra el de otro componente.
let toastTimer: ReturnType<typeof setTimeout> | undefined

/** Aviso breve tras una acción ("Enlace copiado"). Lo pinta `<AdminToast>`. */
export function useToast() {
  const message = useState<string>('admin-toast', () => '')
  function show(text: string) {
    message.value = text
    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => (message.value = ''), 2500)
  }
  return { message, show }
}
