<script setup lang="ts">
// Sección de vuelos (reserva conjunta desde Madrid): estado, nota, último precio visto y fechas de
// búsqueda, con vista previa de lo que ve el invitado y los apuntados.
import { flightsUpdateSchema, type Flights, type FlightStatus } from '#shared/schemas'
import { computeStats } from '#shared/stats'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: invitations } = useAdminInvitations()
const { data: saved, refresh } = useAsyncData('admin-flights', () =>
  adminFetch<Flights>('/api/flights'),
)
const toast = useToast()
const joint = computed(() => computeStats(invitations.value).jointFlight)

const STATUS_OPTIONS: { value: FlightStatus; label: string }[] = [
  { value: 'soon', label: 'Próximamente (banner, sin pregunta en la tarjeta)' },
  { value: 'watching', label: 'Mirando precios' },
  { value: 'open', label: 'Reserva conjunta abierta' },
  { value: 'closed', label: 'Reserva cerrada' },
]

const form = reactive({
  status: 'soon' as FlightStatus,
  openUntil: '',
  noteEs: '',
  noteRo: '',
  amount: '' as number | '',
  seenOn: '',
  outbound: '',
  inbound: '',
})
const error = ref<FieldError | null>(null)
const saving = ref(false)

function load(f: Flights) {
  Object.assign(form, {
    status: f.status,
    openUntil: f.openUntil ?? '',
    noteEs: f.note.es,
    noteRo: f.note.ro,
    amount: f.lastPrice?.amount ?? '',
    seenOn: f.lastPrice?.seenOn ?? '',
    outbound: f.outbound,
    inbound: f.inbound,
  })
  error.value = null
}
watch(saved, (f) => f && load(f), { immediate: true })

const update = computed(() => ({
  status: form.status,
  openUntil: form.status === 'open' ? form.openUntil || null : null,
  note: { es: form.noteEs, ro: form.noteRo },
  lastPrice: form.amount === '' ? null : { amount: Number(form.amount), seenOn: form.seenOn },
  outbound: form.outbound,
  inbound: form.inbound,
}))
const changed = computed(
  () => !!saved.value && JSON.stringify(update.value) !== JSON.stringify(withoutDate(saved.value)),
)
function withoutDate(f: Flights) {
  const { updatedAt: _updatedAt, ...rest } = f
  return rest
}

/** Vista previa con lo que hay en el formulario (aunque aún no sea válido del todo). */
const preview = computed<Flights>(() => ({
  ...(saved.value as Flights),
  ...update.value,
  lastPrice: update.value.lastPrice && form.seenOn ? update.value.lastPrice : null,
}))

async function save() {
  error.value = null
  const parsed = flightsUpdateSchema.safeParse(update.value)
  if (!parsed.success) {
    error.value = firstFieldError(parsed.error, FLIGHTS_MESSAGES)
    void focusFirstError()
    return
  }
  saving.value = true
  try {
    await adminFetch('/api/admin/flights', { method: 'PUT', body: parsed.data })
    await refresh()
    toast.show('Vuelos guardados')
  } catch {
    toast.show('No se ha podido guardar. Inténtalo otra vez.')
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div>
    <h1>Vuelos</h1>
    <p class="muted intro">
      Sin reservas desde la web: aquí contáis cómo va la reserva conjunta desde Madrid. Para que os
      avise de las bajadas de precio, activad el seguimiento de precios de Google Flights con
      vuestra cuenta.
    </p>

    <div class="grid">
      <section class="card" aria-labelledby="joint-title">
        <h2 id="joint-title">Apuntados a la reserva conjunta</h2>
        <p class="joint">
          <strong>{{ joint.people }}</strong>
          {{ joint.people === 1 ? 'persona' : 'personas' }} ·
          {{ plural(joint.invitations, 'invitación', 'invitaciones') }}
        </p>
        <NuxtLink to="/admin?f=flight" class="btn btn--small">Ver y avisar por WhatsApp</NuxtLink>
      </section>

      <section class="card form-card" aria-labelledby="edit-title">
        <h2 id="edit-title">Lo que ven los invitados</h2>
        <form novalidate @submit.prevent="save">
          <label class="field">
            <span class="label">Estado</span>
            <select
              v-model="form.status"
              class="input"
              :aria-invalid="error?.field === 'status' || undefined"
            >
              <option v-for="o in STATUS_OPTIONS" :key="o.value" :value="o.value">
                {{ o.label }}
              </option>
            </select>
          </label>
          <label v-if="form.status === 'open'" class="field">
            <span class="label">Abierta hasta el</span>
            <input
              v-model="form.openUntil"
              class="input"
              type="date"
              :aria-invalid="error?.field === 'openUntil' || undefined"
            />
            <span v-if="error?.field === 'openUntil'" class="field-error" role="alert">{{
              error.message
            }}</span>
          </label>
          <label class="field">
            <span class="label">Nota en español (opcional)</span>
            <textarea
              v-model="form.noteEs"
              class="input note"
              maxlength="280"
              rows="3"
              lang="es"
              :aria-invalid="error?.field === 'note' || undefined"
            ></textarea>
          </label>
          <label class="field">
            <span class="label">Nota en rumano (opcional)</span>
            <textarea
              v-model="form.noteRo"
              class="input note"
              maxlength="280"
              rows="3"
              lang="ro"
            ></textarea>
            <span v-if="error?.field === 'note'" class="field-error" role="alert">{{
              error.message
            }}</span>
          </label>
          <fieldset class="pair">
            <legend class="label">Último precio visto (opcional)</legend>
            <label class="field">
              <span class="hint">€ por persona, ida y vuelta</span>
              <input
                v-model.number="form.amount"
                class="input"
                type="number"
                inputmode="numeric"
                min="1"
                max="5000"
                :aria-invalid="error?.field === 'lastPrice' || undefined"
              />
            </label>
            <label class="field">
              <span class="hint">Visto el</span>
              <input v-model="form.seenOn" class="input" type="date" />
            </label>
            <span v-if="error?.field === 'lastPrice'" class="field-error" role="alert">{{
              error.message
            }}</span>
          </fieldset>
          <fieldset class="pair">
            <legend class="label">Fechas para los enlaces de búsqueda</legend>
            <label class="field">
              <span class="hint">Ida</span>
              <input
                v-model="form.outbound"
                class="input"
                type="date"
                :aria-invalid="error?.field === 'outbound' || undefined"
              />
            </label>
            <label class="field">
              <span class="hint">Vuelta</span>
              <input
                v-model="form.inbound"
                class="input"
                type="date"
                :aria-invalid="error?.field === 'inbound' || undefined"
              />
            </label>
            <span
              v-if="error?.field === 'inbound' || error?.field === 'outbound'"
              class="field-error"
              role="alert"
              >{{ error.message }}</span
            >
          </fieldset>
          <div class="btn-row actions">
            <button type="submit" class="btn btn--primary" :disabled="!changed || saving">
              Guardar
            </button>
            <button
              v-if="changed"
              type="button"
              class="btn btn--ghost"
              @click="saved && load(saved)"
            >
              Deshacer
            </button>
          </div>
        </form>
      </section>

      <section class="preview" aria-label="Vista previa">
        <span class="label">Vista previa (en la web del invitado)</span>
        <template v-if="saved">
          <FlightsBoard v-if="preview.status !== 'soon'" :flights="preview" />
          <ComingSoon v-else />
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.intro {
  margin: 0 0 1rem;
}
.grid {
  display: grid;
  gap: 1rem;
}
.grid .card + .card {
  margin-top: 0;
}
.joint {
  margin: 0 0 0.75rem;
  font-size: var(--fs-lead);
}
.joint strong {
  font-size: 2rem;
  font-stretch: var(--stretch-tile);
}
.note {
  min-height: 5rem;
}
.pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.375rem 0.75rem;
  margin: 0.875rem 0 0;
  padding: 0;
  border: 0;
}
.pair legend {
  margin-bottom: 0.375rem;
}
.pair .field + .field {
  margin-top: 0;
}
.pair .field-error {
  grid-column: 1 / -1;
}
/* Los campos de fecha tienen un ancho mínimo propio: sin esto se salen de la tarjeta a 360px */
.pair .input {
  min-width: 0;
}
.actions {
  margin-top: 1rem;
}
/* La vista previa reutiliza los componentes públicos tal cual, sin sus márgenes de página */
.preview :deep(.flights-wrap),
.preview :deep(.soon-wrap) {
  padding: 0.5rem 0 0;
}
@media (min-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
  .form-card {
    grid-row: span 2;
  }
}
</style>
