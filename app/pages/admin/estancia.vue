<script setup lang="ts">
// Alojamiento y traslados: alojamientos recomendados, salidas de autobús y notas ES/RO, con vista previa
// de lo que ve el invitado. Cada parte se publica en cuanto tiene contenido.
import { MAX_BUSES, MAX_HOTELS, stayUpdateSchema, type Stay } from '#shared/schemas'
import { DEFAULT_STAY, stayReady } from '#shared/stay'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: saved, refresh } = useAsyncData('admin-stay', () => adminFetch<Stay>('/api/stay'))
const toast = useToast()

interface HotelDraft {
  name: string
  url: string
  km: number | ''
  noteEs: string
  noteRo: string
}
interface BusDraft {
  place: string
  time: string
}

const form = reactive({
  hotels: [] as HotelDraft[],
  hotelsNoteEs: '',
  hotelsNoteRo: '',
  buses: [] as BusDraft[],
  transfersNoteEs: '',
  transfersNoteRo: '',
})
const error = ref<{ field: string; message: string } | null>(null)
const saving = ref(false)

function load(s: Stay) {
  Object.assign(form, {
    hotels: s.hotels.map((h) => ({
      name: h.name,
      url: h.url,
      km: h.km ?? '',
      noteEs: h.note.es,
      noteRo: h.note.ro,
    })),
    hotelsNoteEs: s.hotelsNote.es,
    hotelsNoteRo: s.hotelsNote.ro,
    buses: s.buses.map((b) => ({ ...b })),
    transfersNoteEs: s.transfersNote.es,
    transfersNoteRo: s.transfersNote.ro,
  })
  error.value = null
}
watch(saved, (s) => s && load(s), { immediate: true })

const update = computed(() => ({
  hotels: form.hotels.map((h) => ({
    name: h.name,
    url: h.url.trim(),
    km: h.km === '' ? null : Number(h.km),
    note: { es: h.noteEs, ro: h.noteRo },
  })),
  hotelsNote: { es: form.hotelsNoteEs, ro: form.hotelsNoteRo },
  buses: form.buses.map((b) => ({ place: b.place, time: b.time })),
  transfersNote: { es: form.transfersNoteEs, ro: form.transfersNoteRo },
}))
const changed = computed(
  () => !!saved.value && JSON.stringify(update.value) !== JSON.stringify(withoutDate(saved.value)),
)
function withoutDate(s: Stay) {
  const { updatedAt: _updatedAt, ...rest } = s
  return rest
}

/** Vista previa: solo lo que ya es válido (un alojamiento sin nombre o una salida sin hora no salen). */
const preview = computed<Stay>(() => ({
  ...DEFAULT_STAY,
  ...update.value,
  hotels: update.value.hotels.filter((h) => h.name.trim()),
  buses: update.value.buses.filter((b) => b.place.trim() && b.time),
}))
const previewReady = computed(() => stayReady(preview.value))

const MESSAGES: Record<string, string> = {
  name: 'Escribe el nombre del alojamiento (máx. 80 caracteres).',
  url: 'Enlace no válido: cópialo entero, empezando por https://',
  km: 'Distancia no válida: de 0 a 200 km.',
  note: 'La nota del alojamiento no puede pasar de 140 caracteres.',
  hotelsNote: 'La nota no puede pasar de 280 caracteres.',
  transfersNote: 'La nota no puede pasar de 280 caracteres.',
  place: 'Escribe el punto de salida (máx. 80 caracteres).',
  time: 'Indica la hora de salida.',
}
/** Campo con error como ruta (`hotels.0.name`, `buses.1.time`, `hotelsNote`). */
const isInvalid = (field: string) => error.value?.field === field || undefined

async function save() {
  error.value = null
  const parsed = stayUpdateSchema.safeParse(update.value)
  if (!parsed.success) {
    const path = parsed.error.issues[0]?.path ?? []
    const field = path.slice(0, path[0] === 'hotels' || path[0] === 'buses' ? 3 : 1).join('.')
    const key = String(path.length > 2 ? path[2] : path[0])
    error.value = { field, message: MESSAGES[key] ?? 'Revisa los datos.' }
    void focusFirstError()
    return
  }
  saving.value = true
  try {
    await adminFetch('/api/admin/stay', { method: 'PUT', body: parsed.data })
    await refresh()
    toast.show('Alojamiento y traslados guardados')
  } catch {
    toast.show('No se ha podido guardar. Inténtalo otra vez.')
  } finally {
    saving.value = false
  }
}

function addHotel() {
  form.hotels.push({ name: '', url: '', km: '', noteEs: '', noteRo: '' })
}
function addBus() {
  form.buses.push({ place: '', time: '' })
}
</script>

<template>
  <div>
    <h1>Alojamiento y traslados</h1>
    <p class="muted intro">
      Cada parte aparece en la web en cuanto tiene algo (una lista o una nota). Mientras está vacía,
      el invitado sigue viendo «Próximamente».
    </p>

    <div class="grid">
      <form class="forms" novalidate @submit.prevent="save">
        <section class="card" aria-labelledby="edit-hotels">
          <h2 id="edit-hotels">🏨 Alojamiento</h2>
          <label class="field">
            <span class="label">Nota en español (opcional)</span>
            <textarea
              v-model="form.hotelsNoteEs"
              class="input note"
              maxlength="280"
              rows="3"
              lang="es"
              :aria-invalid="isInvalid('hotelsNote')"
            ></textarea>
          </label>
          <label class="field">
            <span class="label">Nota en rumano (opcional)</span>
            <textarea
              v-model="form.hotelsNoteRo"
              class="input note"
              maxlength="280"
              rows="3"
              lang="ro"
            ></textarea>
            <span v-if="error?.field === 'hotelsNote'" class="field-error" role="alert">{{
              error.message
            }}</span>
          </label>

          <fieldset v-for="(hotel, i) in form.hotels" :key="i" class="item">
            <legend class="label">Alojamiento {{ i + 1 }}</legend>
            <label class="field">
              <span class="hint">Nombre</span>
              <input
                v-model="hotel.name"
                class="input"
                maxlength="80"
                autocomplete="off"
                :aria-invalid="isInvalid(`hotels.${i}.name`)"
              />
            </label>
            <label class="field">
              <span class="hint">Enlace (opcional)</span>
              <input
                v-model="hotel.url"
                class="input"
                type="url"
                inputmode="url"
                placeholder="https://"
                autocomplete="off"
                :aria-invalid="isInvalid(`hotels.${i}.url`)"
              />
            </label>
            <label class="field">
              <span class="hint">Distancia al Roots en km (opcional)</span>
              <input
                v-model.number="hotel.km"
                class="input km"
                type="number"
                inputmode="decimal"
                min="0"
                max="200"
                step="0.1"
                :aria-invalid="isInvalid(`hotels.${i}.km`)"
              />
            </label>
            <label class="field">
              <span class="hint">Nota corta en español (opcional)</span>
              <input
                v-model="hotel.noteEs"
                class="input"
                maxlength="140"
                lang="es"
                :aria-invalid="isInvalid(`hotels.${i}.note`)"
              />
            </label>
            <label class="field">
              <span class="hint">Nota corta en rumano (opcional)</span>
              <input v-model="hotel.noteRo" class="input" maxlength="140" lang="ro" />
            </label>
            <span v-if="error?.field.startsWith(`hotels.${i}.`)" class="field-error" role="alert">{{
              error.message
            }}</span>
            <button
              type="button"
              class="btn btn--small btn--ghost"
              @click="form.hotels.splice(i, 1)"
            >
              Quitar alojamiento {{ i + 1 }}
            </button>
          </fieldset>
          <button
            v-if="form.hotels.length < MAX_HOTELS"
            type="button"
            class="btn btn--small add"
            @click="addHotel"
          >
            + Añadir alojamiento
          </button>
          <p v-else class="hint">Máximo {{ MAX_HOTELS }} alojamientos.</p>
        </section>

        <section class="card" aria-labelledby="edit-transfers">
          <h2 id="edit-transfers">🚌 Traslados</h2>
          <label class="field">
            <span class="label">Nota en español (opcional)</span>
            <textarea
              v-model="form.transfersNoteEs"
              class="input note"
              maxlength="280"
              rows="3"
              lang="es"
              :aria-invalid="isInvalid('transfersNote')"
            ></textarea>
          </label>
          <label class="field">
            <span class="label">Nota en rumano (opcional)</span>
            <textarea
              v-model="form.transfersNoteRo"
              class="input note"
              maxlength="280"
              rows="3"
              lang="ro"
            ></textarea>
            <span v-if="error?.field === 'transfersNote'" class="field-error" role="alert">{{
              error.message
            }}</span>
          </label>

          <p class="label buses-title">Autobús el día de la boda (opcional)</p>
          <p class="hint">
            Hora de Rumanía. La vuelta va como otra salida, p. ej. «Roots → Alba Iulia».
          </p>
          <fieldset v-for="(bus, i) in form.buses" :key="i" class="bus">
            <legend class="sr-only">Salida {{ i + 1 }}</legend>
            <label class="field">
              <span class="hint">Hora</span>
              <input
                v-model="bus.time"
                class="input"
                type="time"
                :aria-invalid="isInvalid(`buses.${i}.time`)"
              />
            </label>
            <label class="field">
              <span class="hint">Punto de salida</span>
              <input
                v-model="bus.place"
                class="input"
                maxlength="80"
                autocomplete="off"
                :aria-invalid="isInvalid(`buses.${i}.place`)"
              />
            </label>
            <button
              type="button"
              class="btn btn--small btn--ghost bus__remove"
              @click="form.buses.splice(i, 1)"
            >
              Quitar<span class="sr-only"> la salida {{ i + 1 }}</span>
            </button>
            <span
              v-if="error?.field.startsWith(`buses.${i}.`)"
              class="field-error bus__error"
              role="alert"
              >{{ error.message }}</span
            >
          </fieldset>
          <button
            v-if="form.buses.length < MAX_BUSES"
            type="button"
            class="btn btn--small add"
            @click="addBus"
          >
            + Añadir salida
          </button>
          <p v-else class="hint">Máximo {{ MAX_BUSES }} salidas.</p>
        </section>

        <div class="btn-row actions">
          <button type="submit" class="btn btn--primary" :disabled="!changed || saving">
            Guardar
          </button>
          <button v-if="changed" type="button" class="btn btn--ghost" @click="saved && load(saved)">
            Deshacer
          </button>
        </div>
      </form>

      <section class="preview" aria-label="Vista previa">
        <span class="label">Vista previa (en la web del invitado)</span>
        <template v-if="saved">
          <StayBoard v-if="previewReady.hotels || previewReady.transfers" :stay="preview" />
          <ComingSoon
            v-if="!previewReady.hotels || !previewReady.transfers"
            :pending="{
              flights: false,
              hotels: !previewReady.hotels,
              transfers: !previewReady.transfers,
            }"
          />
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
.forms .card + .card {
  margin-top: 1rem;
}
.note {
  min-height: 5rem;
}
.item {
  display: grid;
  margin: 1.25rem 0 0;
  padding: 1rem 0 0;
  border: 0;
  border-top: 1px solid var(--line);
}
.item legend {
  float: left;
  width: 100%;
  margin-bottom: 0.25rem;
  padding: 0;
}
.item .btn {
  justify-self: start;
  margin-top: 0.75rem;
}
.km {
  max-width: 10rem;
}
.add {
  margin-top: 1rem;
}
.buses-title {
  margin: 1.25rem 0 0;
}
.bus {
  display: grid;
  grid-template-columns: 7rem minmax(0, 1fr);
  gap: 0.375rem 0.75rem;
  align-items: end;
  margin: 0.75rem 0 0;
  padding: 0;
  border: 0;
}
.bus .field + .field {
  margin-top: 0;
}
.bus .input {
  min-width: 0;
}
.bus__remove {
  grid-column: 1 / -1;
  justify-self: start;
}
.bus__error {
  grid-column: 1 / -1;
}
.actions {
  margin-top: 1rem;
}
/* La vista previa reutiliza los componentes públicos tal cual, sin sus márgenes de página */
.preview :deep(.stay-wrap),
.preview :deep(.soon-wrap) {
  padding: 0.5rem 0 0;
}
@media (min-width: 960px) {
  .grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    align-items: start;
  }
  .preview {
    position: sticky;
    top: 1rem;
  }
}
</style>
