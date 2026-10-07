<script setup lang="ts">
// Envío de una invitación: WhatsApp (api.whatsapp.com/send), Compartir (Web Share API) y Copiar enlace.
// `kind` decide el mensaje: invitación o recordatorio (solo para pendientes ya invitados).
import type { AdminInvitation, MessageKind } from '#shared/schemas'

const props = defineProps<{
  invitation: AdminInvitation
  kind: MessageKind
  primary?: boolean
  /** En la ficha, el enlace ya tiene su propio botón de copiar. */
  noCopy?: boolean
}>()

const send = useSend()
const toast = useToast()

const whatsappLabel = computed(() =>
  props.kind === 'flights'
    ? 'Aviso de vuelos'
    : props.kind === 'reminder'
      ? 'Recordatorio'
      : props.invitation.invitedSentAt
        ? 'Reenviar'
        : 'Enviar invitación',
)

function onWhatsapp() {
  // El enlace se abre por su cuenta (sin esperar), así el navegador no lo bloquea como ventana emergente.
  send.record(props.invitation, props.kind).catch(() => {
    toast.show('No se ha podido registrar el envío.')
  })
}

async function onCopy() {
  toast.show((await send.copyLink(props.invitation)) ? 'Enlace copiado' : 'No se ha podido copiar.')
}
</script>

<template>
  <div class="btn-row">
    <a
      class="btn btn--small"
      :class="{ 'btn--primary': primary }"
      :href="send.whatsapp(invitation, kind)"
      target="_blank"
      rel="noopener noreferrer"
      @click="onWhatsapp"
    >
      <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="currentColor"
          d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z"
        />
      </svg>
      {{ whatsappLabel }}
      <span class="sr-only">por WhatsApp a {{ invitation.guestName }}</span>
    </a>
    <button
      v-if="send.canShare"
      type="button"
      class="btn btn--small"
      @click="send.share(invitation, kind)"
    >
      Compartir
    </button>
    <button v-if="!noCopy" type="button" class="btn btn--small" @click="onCopy">
      Copiar enlace
    </button>
  </div>
</template>
