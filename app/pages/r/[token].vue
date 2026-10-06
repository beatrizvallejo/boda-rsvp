<script setup lang="ts">
/**
 * Página personal de cada invitado (/r/<token>): la tarjeta de embarque con su nombre precargado.
 * El idioma inicial es el de la invitación, salvo que el invitado ya haya elegido otro.
 * Fase 3: el botón muestra la pantalla de éxito sin guardar; el envío a la API llega en la Fase 4.
 */
import type { PublicInvitationResponse, RsvpInput } from '#shared/schemas'

const route = useRoute()
const { t, setLocale } = useI18n()
const token = String(route.params.token)

const { data, error } = await useFetch<PublicInvitationResponse>(
  `/api/rsvp/${encodeURIComponent(token)}`,
)

const localeCookie = useCookie('boda_locale')
if (data.value && !localeCookie.value) await setLocale(data.value.invitation.locale)

const notFound = computed(() => error.value?.statusCode === 404)
// El aviso se muestra igual, pero la respuesta HTTP es 404 (no indexable, coherente con la API).
if (import.meta.server && notFound.value) setResponseStatus(useRequestEvent()!, 404)
const confirmed = ref<string[] | null>(null)
function onConfirm(input: RsvpInput) {
  confirmed.value = [input.guestName, input.companionName].filter((n): n is string => Boolean(n))
}
</script>

<template>
  <div>
    <PublicPage>
      <section v-if="data && !data.closed" class="pass-section" aria-labelledby="pass-title">
        <h1 id="pass-title" class="pass-section__title">{{ t('pass.title') }}</h1>
        <p class="pass-section__lead">{{ t('pass.lead') }}</p>
        <BoardingPass
          :guest-name="data.invitation.guestName"
          :rsvp="data.rsvp"
          @confirm="onConfirm"
        />
      </section>

      <section v-else class="notice" aria-labelledby="notice-title">
        <h1 id="notice-title" class="notice__title">
          {{ notFound ? t('errors.notFoundTitle') : data?.closed ? t('errors.closedTitle') : '✈' }}
        </h1>
        <p class="notice__text">
          {{
            notFound
              ? t('errors.notFound')
              : data?.closed
                ? t('errors.closed')
                : t('errors.generic')
          }}
        </p>
      </section>
    </PublicPage>

    <SuccessScreen v-if="confirmed" :passengers="confirmed" @close="confirmed = null" />
  </div>
</template>

<style scoped>
.pass-section {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1rem var(--gutter) 1rem;
}
.pass-section__title {
  margin: 0 0 0.25rem;
  font-size: var(--fs-section);
  font-weight: 800;
  font-stretch: 85%;
}
.pass-section__lead {
  margin: 0 0 1.5rem;
  color: var(--muted);
}
.notice {
  max-width: 40rem;
  margin: 1.5rem auto 1rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
}
@media (max-width: 719px) {
  .notice {
    margin-inline: var(--gutter);
  }
}
.notice__title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: 85%;
}
.notice__text {
  margin: 0;
  color: var(--muted);
}
</style>
