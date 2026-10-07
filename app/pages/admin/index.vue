<script setup lang="ts">
// Listado de invitaciones: métricas, búsqueda, filtros (en la URL, para volver de la ficha sin perderlos)
// y exportación CSV. En móvil, lista apilada; en escritorio, tabla.
import type { AdminInvitation } from '#shared/schemas'
import { computeStats } from '#shared/stats'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: invitations, status, error } = useAdminInvitations()
useAdminTemplates()
const stats = computed(() => computeStats(invitations.value))

type Filter = 'all' | 'confirmed' | 'pending' | 'unsent'
const FILTERS: { value: Filter; label: string; test: (i: AdminInvitation) => boolean }[] = [
  { value: 'all', label: 'Todos', test: () => true },
  { value: 'confirmed', label: 'Confirmados', test: (i) => !!i.rsvp },
  { value: 'pending', label: 'Pendientes', test: (i) => !i.rsvp },
  { value: 'unsent', label: 'Sin enviar', test: (i) => !i.invitedSentAt },
]
const NO_LABEL = '__sin__'

const route = useRoute()
const router = useRouter()
function queryParam(name: string): string {
  const value = route.query[name]
  return typeof value === 'string' ? value : ''
}
function setQuery(name: string, value: string) {
  router.replace({ query: { ...route.query, [name]: value || undefined } })
}

const search = computed({ get: () => queryParam('q'), set: (v) => setQuery('q', v) })
const filter = computed<Filter>({
  get: () =>
    FILTERS.some((f) => f.value === queryParam('f')) ? (queryParam('f') as Filter) : 'all',
  set: (v) => setQuery('f', v === 'all' ? '' : v),
})
const label = computed({ get: () => queryParam('e'), set: (v) => setQuery('e', v) })

const labels = computed(() =>
  [...new Set(invitations.value.map((i) => i.label).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  ),
)

function normalize(text: string) {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

const filtered = computed(() => {
  const test = FILTERS.find((f) => f.value === filter.value)!.test
  const words = normalize(search.value).split(/\s+/).filter(Boolean)
  return invitations.value
    .filter(test)
    .filter((i) => !label.value || (label.value === NO_LABEL ? !i.label : i.label === label.value))
    .filter((i) => {
      if (!words.length) return true
      const haystack = normalize(
        [i.guestName, i.rsvp?.guestName, i.rsvp?.companionName, i.label].filter(Boolean).join(' '),
      )
      return words.every((w) => haystack.includes(w))
    })
    .sort((a, b) => a.guestName.localeCompare(b.guestName, 'es'))
})

function count(f: (typeof FILTERS)[number]) {
  return invitations.value.filter(f.test).length
}
</script>

<template>
  <div>
    <h1 class="sr-only">Invitados</h1>
    <AdminStats :stats="stats" />

    <section class="toolbar" aria-label="Buscar y filtrar">
      <label class="field toolbar__search">
        <span class="sr-only">Buscar por nombre</span>
        <input
          v-model.trim="search"
          class="input"
          type="search"
          placeholder="Buscar por nombre o acompañante"
          autocomplete="off"
          enterkeyhint="search"
        />
      </label>
      <div class="chips" role="group" aria-label="Estado">
        <button
          v-for="f in FILTERS"
          :key="f.value"
          type="button"
          class="chip"
          :aria-pressed="filter === f.value"
          @click="filter = f.value"
        >
          {{ f.label }} <span class="chip__count">{{ count(f) }}</span>
        </button>
      </div>
      <div class="toolbar__row">
        <label class="toolbar__label">
          <span class="sr-only">Etiqueta</span>
          <select v-model="label" class="input">
            <option value="">Todas las etiquetas</option>
            <option v-for="l in labels" :key="l" :value="l">{{ l }}</option>
            <option :value="NO_LABEL">Sin etiqueta</option>
          </select>
        </label>
        <a class="btn btn--small" href="/api/admin/export.csv" download>Descargar CSV</a>
      </div>
    </section>

    <p v-if="error" class="card field-error" role="alert">
      No hemos podido cargar las invitaciones. Recarga la página.
    </p>
    <p v-else-if="status === 'pending' && !invitations.length" class="muted">Cargando…</p>
    <div v-else-if="!invitations.length" class="card empty">
      <p>Aún no hay invitaciones. ✈️</p>
      <NuxtLink to="/admin/nueva" class="btn btn--primary">Añadir invitados</NuxtLink>
    </div>
    <template v-else>
      <p class="muted results" aria-live="polite">
        {{ filtered.length }} de {{ invitations.length }} invitaciones
      </p>
      <div class="list" role="table" aria-label="Invitaciones">
        <div class="list__head" role="row">
          <span role="columnheader">Invitado</span>
          <span role="columnheader">Estado</span>
          <span role="columnheader">Personas</span>
          <span role="columnheader">Envíos</span>
          <span role="columnheader">Acciones</span>
        </div>
        <AdminInvitationRow v-for="i in filtered" :key="i.id" :invitation="i" />
      </div>
      <p v-if="!filtered.length" class="card muted">Ninguna invitación coincide con el filtro.</p>
    </template>
  </div>
</template>

<style scoped>
.toolbar {
  display: grid;
  gap: 0.75rem;
  margin: 1.25rem 0 0.75rem;
}
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.375rem;
}
.chip {
  min-height: 44px;
  padding: 0 0.875rem;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--ink);
  cursor: pointer;
  background: var(--paper);
  border: 1.5px solid var(--line);
  border-radius: 999px;
}
.chip[aria-pressed='true'] {
  background: var(--ink);
  border-color: var(--ink);
  color: var(--paper);
}
.chip__count {
  font-weight: 400;
  opacity: 0.75;
}
.toolbar__row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.toolbar__label {
  flex: 1;
  min-width: 0;
}
.results {
  margin: 0 0 0.5rem;
  font-size: var(--fs-small);
}
.empty {
  text-align: center;
}
.list {
  display: grid;
  gap: 0.75rem;
}
.list__head {
  display: none;
}
@media (min-width: 960px) {
  .toolbar {
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }
  .toolbar__search {
    grid-column: 1 / -1;
  }
  .list {
    gap: 0;
    overflow: hidden;
    background: var(--paper);
    border-radius: var(--radius-pass);
    box-shadow: var(--shadow-pass);
  }
  .list__head {
    display: grid;
    grid-template-columns: var(--admin-columns);
    gap: 1rem;
    padding: 0.75rem 1.25rem;
    font-size: var(--fs-label);
    font-weight: 700;
    font-stretch: var(--stretch-label);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--muted);
    border-bottom: 1px solid var(--line);
  }
}
</style>
