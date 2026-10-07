<script setup lang="ts">
// Alta de invitaciones: una a una, o importando una lista pegada desde Excel/Sheets o un .csv.
import { invitationCreateSchema, type Invitation } from '#shared/schemas'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: invitations, refresh } = useAdminInvitations()
const toast = useToast()
const labels = computed(() => [...new Set(invitations.value.map((i) => i.label).filter(Boolean))])

// ── Una a una ────────────────────────────────────────────────────────────
const form = reactive({ guestName: '', locale: 'es' as 'es' | 'ro', phone: '', label: '' })
const formError = ref<{ field: string; message: string } | null>(null)
const creating = ref(false)

async function create() {
  formError.value = null
  const parsed = invitationCreateSchema.safeParse(form)
  if (!parsed.success) {
    const field = String(parsed.error.issues[0]?.path[0] ?? '')
    formError.value = {
      field,
      message:
        field === 'phone'
          ? 'Teléfono no válido: escríbelo con prefijo, p. ej. +34 600 111 222.'
          : field === 'guestName'
            ? 'Escribe el nombre del invitado (máx. 80 caracteres).'
            : 'Etiqueta demasiado larga (máx. 80 caracteres).',
    }
    void focusFirstError()
    return
  }
  creating.value = true
  try {
    const [created] = await adminFetch<Invitation[]>('/api/admin/invitations', {
      method: 'POST',
      body: parsed.data,
    })
    await refresh()
    toast.show('Invitación creada')
    await navigateTo(`/admin/i/${created!.id}`)
  } catch {
    toast.show('No se ha podido crear. Inténtalo otra vez.')
  } finally {
    creating.value = false
  }
}

// ── Importación ──────────────────────────────────────────────────────────
const pasted = ref('')
const rows = ref<ImportRow[] | null>(null)
const importing = ref(false)
const valid = computed(() => rows.value?.filter((r) => r.data) ?? [])
const invalid = computed(() => rows.value?.filter((r) => !r.data) ?? [])

function review() {
  rows.value = parseGuestList(
    pasted.value,
    invitations.value.map((i) => i.guestName),
  )
}

async function onFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  pasted.value = await file.text()
  review()
}

async function runImport() {
  if (!valid.value.length) return
  importing.value = true
  try {
    const created = await adminFetch<Invitation[]>('/api/admin/invitations', {
      method: 'POST',
      body: valid.value.map((r) => r.data),
    })
    await refresh()
    toast.show(`${plural(created.length, 'invitación importada', 'invitaciones importadas')}`)
    pasted.value = ''
    rows.value = null
    await navigateTo('/admin?f=unsent')
  } catch {
    toast.show('No se ha podido importar. No se ha guardado nada; inténtalo otra vez.')
  } finally {
    importing.value = false
  }
}
</script>

<template>
  <div class="new">
    <h1>Añadir invitados</h1>
    <div class="new__grid">
      <section class="card" aria-labelledby="one-title">
        <h2 id="one-title">Una invitación</h2>
        <p class="hint intro">
          Una invitación es para una persona, que puede venir con acompañante.
        </p>
        <form novalidate @submit.prevent="create">
          <label class="field">
            <span class="label">Nombre</span>
            <input
              v-model="form.guestName"
              class="input"
              autocomplete="off"
              :aria-invalid="formError?.field === 'guestName' || undefined"
            />
            <span v-if="formError?.field === 'guestName'" class="field-error" role="alert">{{
              formError.message
            }}</span>
          </label>
          <div class="field">
            <span id="new-locale" class="label">Idioma</span>
            <div class="segmented" role="group" aria-labelledby="new-locale">
              <button
                type="button"
                :aria-pressed="form.locale === 'es'"
                @click="form.locale = 'es'"
              >
                ES
              </button>
              <button
                type="button"
                :aria-pressed="form.locale === 'ro'"
                @click="form.locale = 'ro'"
              >
                RO
              </button>
            </div>
          </div>
          <label class="field">
            <span class="label">Teléfono (opcional)</span>
            <input
              v-model="form.phone"
              class="input"
              type="tel"
              inputmode="tel"
              autocomplete="off"
              placeholder="+34 600 111 222"
              :aria-invalid="formError?.field === 'phone' || undefined"
            />
            <span v-if="formError?.field === 'phone'" class="field-error" role="alert">{{
              formError.message
            }}</span>
          </label>
          <label class="field">
            <span class="label">Etiqueta (opcional)</span>
            <input
              v-model="form.label"
              class="input"
              list="new-labels"
              autocomplete="off"
              placeholder="Familia Ro, Amigos Keko…"
              :aria-invalid="formError?.field === 'label' || undefined"
            />
            <span v-if="formError?.field === 'label'" class="field-error" role="alert">{{
              formError.message
            }}</span>
            <datalist id="new-labels">
              <option v-for="l in labels" :key="l" :value="l" />
            </datalist>
          </label>
          <button type="submit" class="btn btn--primary submit" :disabled="creating">
            Crear invitación
          </button>
        </form>
      </section>

      <section class="card" aria-labelledby="import-title">
        <h2 id="import-title">Importar una lista</h2>
        <p class="hint intro">
          Copia las columnas desde Excel o Google Sheets y pégalas aquí, o sube un .csv. Orden:
          <strong>nombre, idioma (ES/RO), teléfono, etiqueta</strong>. Solo el nombre es
          obligatorio; con una fila de cabecera, las columnas pueden ir en cualquier orden.
        </p>
        <label class="field">
          <span class="label">Lista de invitados</span>
          <textarea
            v-model="pasted"
            class="input"
            rows="6"
            spellcheck="false"
            :placeholder="'Ana García López\tES\t+34 600 111 222\tFamilia Keko\nȘtefan Țăranu\tRO\t\tAmigos Ro'"
            @input="rows = null"
          ></textarea>
        </label>
        <div class="btn-row actions">
          <button type="button" class="btn" :disabled="!pasted.trim()" @click="review">
            Revisar lista
          </button>
          <label class="btn btn--ghost file">
            Subir .csv
            <input type="file" accept=".csv,.tsv,.txt,text/csv" class="sr-only" @change="onFile" />
          </label>
        </div>

        <template v-if="rows">
          <p class="summary" aria-live="polite">
            <strong>{{
              `${plural(valid.length, 'invitación lista', 'invitaciones listas')} para importar`
            }}</strong>
            <span v-if="invalid.length">
              · {{ plural(invalid.length, 'fila', 'filas') }} con problemas (no se importan)</span
            >
          </p>
          <ul class="preview">
            <li v-for="r in rows" :key="r.line" :class="{ preview__bad: !r.data }">
              <span class="preview__line">{{ r.line }}</span>
              <span class="preview__body">
                <strong>{{ r.raw.nombre || '(sin nombre)' }}</strong>
                <span v-if="r.data" class="muted">
                  · {{ r.data.locale.toUpperCase()
                  }}<template v-if="r.data.phone"> · {{ r.data.phone }}</template
                  ><template v-if="r.data.label"> · {{ r.data.label }}</template>
                </span>
                <span v-else class="field-error preview__error">{{ r.error }}</span>
              </span>
            </li>
          </ul>
          <button
            type="button"
            class="btn btn--primary submit"
            :disabled="!valid.length || importing"
            @click="runImport"
          >
            Importar {{ plural(valid.length, 'invitación', 'invitaciones') }}
          </button>
        </template>
      </section>
    </div>
  </div>
</template>

<style scoped>
.new__grid {
  display: grid;
  gap: 1rem;
}
.new__grid .card + .card {
  margin-top: 0;
}
.intro {
  margin-bottom: 1rem;
}
.submit {
  width: 100%;
  margin-top: 1rem;
}
.actions {
  margin-top: 0.75rem;
}
.file {
  position: relative;
}
.file:focus-within {
  outline: 3px solid var(--ink);
  outline-offset: 2px;
}
.summary {
  margin: 1.25rem 0 0.5rem;
}
.preview {
  max-height: 22rem;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
  border: 1px solid var(--line);
  border-radius: var(--radius-control);
}
.preview li {
  display: flex;
  gap: 0.75rem;
  padding: 0.5rem 0.75rem;
  font-size: var(--fs-small);
  border-bottom: 1px solid var(--line);
}
.preview li:last-child {
  border-bottom: 0;
}
.preview__bad {
  background: var(--pending-bg);
}
.preview__line {
  flex: 0 0 1.5rem;
  color: var(--muted);
  font-variant-numeric: tabular-nums;
}
.preview__body {
  min-width: 0;
  overflow-wrap: anywhere;
}
.preview__error {
  display: block;
}
@media (min-width: 960px) {
  .new__grid {
    grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
    align-items: start;
  }
}
</style>
