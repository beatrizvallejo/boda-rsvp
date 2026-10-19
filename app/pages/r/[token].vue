<script setup lang="ts">
/**
 * Página personal de cada invitado (/r/<token>): la tarjeta de embarque con su nombre precargado.
 * El idioma es el de la invitación, salvo que el invitado haya elegido otro con el selector en este enlace.
 * La identificación va solo en la URL: volver al mismo enlace permite editar la respuesta.
 */
import type { PublicInvitationResponse, RsvpData, RsvpSaveResponse } from '#shared/schemas'
import type BoardingPass from '~/components/BoardingPass.vue'
import type { FieldIssue } from '~/components/BoardingPass.vue'

const route = useRoute()
const { t, setLocale } = useI18n()
const token = String(route.params.token)

const { data: flights } = await useFlights()
const { data, error } = await useFetch<PublicInvitationResponse>(
  `/api/rsvp/${encodeURIComponent(token)}`,
)

// El idioma de la invitación manda salvo que el invitado haya elegido otro con el selector en este
// mismo enlace.
const localeChosen = useCookie(LOCALE_CHOSEN_COOKIE)
if (data.value) {
  const chosen = chosenLocaleFor(localeChosen.value, token)
  await setLocale(chosen === 'es' || chosen === 'ro' ? chosen : data.value.invitation.locale)
}

const notFound = computed(() => error.value?.statusCode === 404)
// El aviso se muestra igual, pero la respuesta HTTP es 404 (no indexable, coherente con la API).
if (import.meta.server && notFound.value) setResponseStatus(useRequestEvent()!, 404)

const pass = ref<InstanceType<typeof BoardingPass>>()
const pending = ref(false)
const submitError = ref<string | null>(null)
const success = ref<{ passengers: string[]; edited: boolean } | null>(null)

async function onConfirm(input: RsvpData) {
  if (!data.value) return
  pending.value = true
  submitError.value = null
  try {
    const result = await $fetch<RsvpSaveResponse>(`/api/rsvp/${encodeURIComponent(token)}`, {
      method: 'PUT',
      body: input,
    })
    const edited = data.value.rsvp !== null
    // `useFetch` no es reactivo en profundidad (deep: false en Nuxt 4): se reasigna entero.
    data.value = { ...data.value, rsvp: result.rsvp }
    success.value = {
      passengers: [result.rsvp.guestName, result.rsvp.companionName].filter((n): n is string =>
        Boolean(n),
      ),
      edited,
    }
  } catch (err) {
    const status = (err as { statusCode?: number }).statusCode
    const body = (err as { data?: { data?: { issues?: FieldIssue[] } } }).data
    if (status === 422 && body?.data?.issues) {
      pass.value?.showIssues(body.data.issues)
    } else if (status === 410) {
      data.value = { ...data.value, closed: true }
    } else if (status === undefined) {
      submitError.value = t('errors.network')
    } else {
      submitError.value = t('errors.save')
    }
  } finally {
    pending.value = false
  }
}
</script>

<template>
  <div>
    <PublicPage>
      <section
        v-if="data && (!data.closed || data.rsvp)"
        class="pass-section"
        aria-labelledby="pass-title"
      >
        <h1 id="pass-title" class="pass-section__title">{{ t('pass.title') }}</h1>
        <p v-if="data.closed" class="pass-section__closed" role="status">
          <b>{{ t('errors.closedTitle') }}.</b> {{ t('errors.closedWithRsvp') }}
        </p>
        <p v-else class="pass-section__lead">
          {{ data.rsvp ? t('pass.leadConfirmed') : t('pass.lead') }}
        </p>
        <BoardingPass
          ref="pass"
          :guest-name="data.invitation.guestName"
          :rsvp="data.rsvp"
          :readonly="data.closed"
          :pending="pending"
          :submit-error="submitError"
          :ask-joint-flight="flights.status === 'watching' || flights.status === 'open'"
          @confirm="onConfirm"
        />
      </section>

      <PublicNotice
        v-else
        :title="notFound ? t('errors.notFoundTitle') : data?.closed ? t('errors.closedTitle') : '✈'"
        :text="
          notFound ? t('errors.notFound') : data?.closed ? t('errors.closed') : t('errors.generic')
        "
      />
    </PublicPage>

    <SuccessScreen
      v-if="success"
      :passengers="success.passengers"
      :edited="success.edited"
      @close="success = null"
    />
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
  font-stretch: var(--stretch-tile);
}
.pass-section__lead {
  margin: 0 0 1.5rem;
  color: var(--muted);
}
.pass-section__closed {
  max-width: 40rem;
  margin: 0 0 1.5rem;
  padding: 0.875rem 1rem;
  background: var(--paper);
  border-left: 4px solid var(--signal);
  border-radius: var(--radius-control);
}
</style>
