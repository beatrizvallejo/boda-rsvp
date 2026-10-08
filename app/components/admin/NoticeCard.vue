<script setup lang="ts">
// Aviso a confirmados: un mismo mensaje para todos (ES y RO), con el enlace a la web pública, para
// enviarlo de una vez a una lista de difusión o al grupo de invitados. No se registra por persona.
import type { AdminInvitation } from '#shared/schemas'
import { whatsappUrl } from '#shared/whatsapp'

const props = defineProps<{ invitations: AdminInvitation[] }>()

const send = useSend()
const toast = useToast()

const LANGS = [
  { locale: 'es', title: 'Español' },
  { locale: 'ro', title: 'Română' },
] as const
const confirmedBy = computed(() => {
  const confirmed = props.invitations.filter((i) => i.rsvp)
  return {
    es: confirmed.filter((i) => i.locale === 'es').length,
    ro: confirmed.filter((i) => i.locale === 'ro').length,
  }
})

async function copy(locale: 'es' | 'ro') {
  const ok = await copyText(send.generalMessage('notice', locale))
  toast.show(ok ? 'Mensaje copiado' : 'No se ha podido copiar.')
}

async function share(locale: 'es' | 'ro') {
  try {
    await navigator.share({ text: send.generalMessage('notice', locale) })
  } catch {
    // cancelado por el usuario
  }
}
</script>

<template>
  <section class="card notice" aria-labelledby="notice-title">
    <h2 id="notice-title">📣 Aviso a confirmados</h2>
    <p class="hint">
      Un mismo mensaje para todos, con el enlace a la web (alojamiento, traslados y horarios).
      Envíalo a una lista de difusión de WhatsApp o al grupo de invitados. En una lista de difusión
      solo lo reciben quienes tengan guardado vuestro número. Edita el texto en
      <NuxtLink to="/admin/plantillas#t-notice-es">Mensajes</NuxtLink>.
    </p>
    <div v-for="lang in LANGS" :key="lang.locale" class="notice__lang">
      <h3 class="label">
        {{ lang.title }} ·
        {{ plural(confirmedBy[lang.locale], 'confirmado', 'confirmados') }}
      </h3>
      <p class="notice__bubble" :lang="lang.locale">
        {{ send.generalMessage('notice', lang.locale) }}
      </p>
      <div class="btn-row">
        <a
          class="btn btn--small btn--primary"
          :href="whatsappUrl(send.generalMessage('notice', lang.locale), null)"
          target="_blank"
          rel="noopener noreferrer"
          >WhatsApp<span class="sr-only"> · aviso en {{ lang.title }}</span></a
        >
        <button
          v-if="send.canShare"
          type="button"
          class="btn btn--small"
          @click="share(lang.locale)"
        >
          Compartir<span class="sr-only"> · aviso en {{ lang.title }}</span>
        </button>
        <button type="button" class="btn btn--small" @click="copy(lang.locale)">
          Copiar mensaje<span class="sr-only"> en {{ lang.title }}</span>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.notice {
  margin-bottom: 0.75rem;
}
.notice a:not(.btn) {
  color: var(--ink);
}
.notice__lang {
  display: grid;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--line);
}
.notice__lang .label {
  margin: 0;
}
.notice__bubble {
  margin: 0;
  padding: 0.75rem 0.875rem;
  font-size: var(--fs-small);
  white-space: pre-line;
  overflow-wrap: anywhere;
  background: var(--page);
  border-radius: var(--radius-control);
}
@media (min-width: 960px) {
  .notice {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0 1.5rem;
  }
  .notice h2,
  .notice > .hint {
    grid-column: 1 / -1;
  }
}
</style>
