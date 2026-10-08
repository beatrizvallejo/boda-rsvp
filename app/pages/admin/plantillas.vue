<script setup lang="ts">
// Plantillas de WhatsApp (invitación, recordatorio y avisos, en ES y RO) con variables y vista previa.
import {
  TEMPLATE_VARIABLES,
  templateBodySchema,
  type MessageKind,
  type MessageTemplate,
} from '#shared/schemas'
import { formatDeadline, invitationLink, renderTemplate } from '#shared/whatsapp'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const { data: templates, refresh, status } = useAdminTemplates()
const siteUrl = useSiteUrl()
const toast = useToast()

const SLOTS: { kind: MessageKind; locale: 'es' | 'ro'; title: string; example: string }[] = [
  { kind: 'invitation', locale: 'es', title: 'Invitación · Español', example: 'Ana' },
  { kind: 'invitation', locale: 'ro', title: 'Invitación · Română', example: 'Ioana' },
  { kind: 'reminder', locale: 'es', title: 'Recordatorio · Español', example: 'Ana' },
  { kind: 'reminder', locale: 'ro', title: 'Recordatorio · Română', example: 'Ioana' },
  { kind: 'flights', locale: 'es', title: 'Aviso de vuelos · Español', example: 'Ana' },
  { kind: 'flights', locale: 'ro', title: 'Aviso de vuelos · Română', example: 'Ioana' },
  { kind: 'notice', locale: 'es', title: 'Aviso a confirmados · Español', example: 'Ana' },
  { kind: 'notice', locale: 'ro', title: 'Aviso a confirmados · Română', example: 'Ioana' },
]
const VARIABLE_HELP: Record<(typeof TEMPLATE_VARIABLES)[number], string> = {
  '{nombre}': 'nombre del invitado',
  '{enlace}': 'su enlace personal (obligatorio)',
  '{fecha_limite}': 'fecha límite en su idioma',
}
const variableHelp = Object.entries(VARIABLE_HELP)

const key = (kind: string, locale: string) => `${kind}-${locale}`
const drafts = reactive<Record<string, string>>({})
const errors = reactive<Record<string, string>>({})
const saving = ref('')
// Textareas por plantilla, para insertar variables donde está el cursor (no hace falta reactividad).
const areas: Record<string, HTMLTextAreaElement> = {}
function setArea(slot: (typeof SLOTS)[number], el: unknown) {
  if (el instanceof HTMLTextAreaElement) areas[key(slot.kind, slot.locale)] = el
}

function saved(kind: MessageKind, locale: string): MessageTemplate | undefined {
  return templates.value.find((t) => t.kind === kind && t.locale === locale)
}

watch(
  templates,
  () => {
    for (const slot of SLOTS) {
      const k = key(slot.kind, slot.locale)
      if (drafts[k] === undefined || drafts[k] === '')
        drafts[k] = saved(slot.kind, slot.locale)?.body ?? ''
    }
  },
  { immediate: true },
)

function changed(slot: (typeof SLOTS)[number]) {
  const k = key(slot.kind, slot.locale)
  return (drafts[k] ?? '').trim() !== (saved(slot.kind, slot.locale)?.body ?? '')
}

function preview(slot: (typeof SLOTS)[number]) {
  // El aviso a confirmados es un mensaje general: sin nombre y con la web pública.
  const general = slot.kind === 'notice'
  return renderTemplate(drafts[key(slot.kind, slot.locale)] ?? '', {
    nombre: general ? '' : slot.example,
    enlace: general ? siteUrl : invitationLink(siteUrl, `${slot.example.toLowerCase()}-k7f3q2`),
    fecha_limite: formatDeadline(slot.locale),
  })
}

/** Inserta la variable donde está el cursor. */
function insert(slot: (typeof SLOTS)[number], variable: string) {
  const k = key(slot.kind, slot.locale)
  const area = areas[k]
  const text = drafts[k] ?? ''
  const start = area?.selectionStart ?? text.length
  const end = area?.selectionEnd ?? text.length
  drafts[k] = text.slice(0, start) + variable + text.slice(end)
  nextTick(() => {
    area?.focus()
    area?.setSelectionRange(start + variable.length, start + variable.length)
  })
}

async function save(slot: (typeof SLOTS)[number]) {
  const k = key(slot.kind, slot.locale)
  errors[k] = ''
  const parsed = templateBodySchema.safeParse(drafts[k] ?? '')
  if (!parsed.success) {
    const code = parsed.error.issues[0]?.code
    errors[k] =
      code === 'too_small'
        ? 'Escribe el mensaje.'
        : code === 'too_big'
          ? 'Demasiado largo (máx. 1000 caracteres).'
          : 'Falta {enlace}: sin él, el invitado no puede confirmar.'
    return
  }
  saving.value = k
  try {
    await adminFetch(`/api/admin/templates/${slot.kind}/${slot.locale}`, {
      method: 'PUT',
      body: { body: parsed.data },
    })
    drafts[k] = parsed.data
    await refresh()
    toast.show('Mensaje guardado')
  } catch {
    toast.show('No se ha podido guardar. Inténtalo otra vez.')
  } finally {
    saving.value = ''
  }
}

function undo(slot: (typeof SLOTS)[number]) {
  const k = key(slot.kind, slot.locale)
  drafts[k] = saved(slot.kind, slot.locale)?.body ?? ''
  errors[k] = ''
}
</script>

<template>
  <div>
    <h1>Mensajes de WhatsApp</h1>
    <p class="muted intro">
      Cada invitado recibe el mensaje en su idioma. Variables:
      <template v-for="([variable, help], index) in variableHelp" :key="variable">
        <code>{{ variable }}</code> ({{ help }}){{ index < variableHelp.length - 1 ? ', ' : '.' }}
      </template>
    </p>
    <p v-if="status === 'pending' && !templates.length" class="muted">Cargando…</p>
    <div class="grid">
      <section
        v-for="slot in SLOTS"
        :key="key(slot.kind, slot.locale)"
        class="card"
        :aria-labelledby="`t-${key(slot.kind, slot.locale)}`"
      >
        <h2 :id="`t-${key(slot.kind, slot.locale)}`">{{ slot.title }}</h2>
        <p v-if="slot.kind === 'notice'" class="hint">
          Mensaje general para una lista de difusión o un grupo: {enlace} es la web pública y no
          lleva {nombre}.
        </p>
        <p v-if="slot.locale === 'ro'" class="hint ro-note">
          Pendiente de revisión por un hablante nativo antes de enviar.
        </p>
        <label class="field">
          <span class="sr-only">Texto del mensaje</span>
          <textarea
            :ref="(el) => setArea(slot, el)"
            v-model="drafts[key(slot.kind, slot.locale)]"
            class="input"
            rows="6"
            :lang="slot.locale"
            :aria-invalid="errors[key(slot.kind, slot.locale)] ? 'true' : undefined"
          ></textarea>
        </label>
        <div class="vars" role="group" aria-label="Insertar variable">
          <button
            v-for="variable in TEMPLATE_VARIABLES"
            :key="variable"
            type="button"
            class="btn btn--small btn--ghost var"
            @click="insert(slot, variable)"
          >
            + {{ variable }}
          </button>
        </div>
        <p v-if="errors[key(slot.kind, slot.locale)]" class="field-error" role="alert">
          {{ errors[key(slot.kind, slot.locale)] }}
        </p>
        <span class="label preview-label">Así lo verá {{ slot.example }}</span>
        <p class="bubble" :lang="slot.locale">{{ preview(slot) }}</p>
        <div class="btn-row">
          <button
            type="button"
            class="btn btn--primary"
            :disabled="!changed(slot) || saving === key(slot.kind, slot.locale)"
            @click="save(slot)"
          >
            Guardar
          </button>
          <button v-if="changed(slot)" type="button" class="btn btn--ghost" @click="undo(slot)">
            Deshacer
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.intro {
  margin: 0 0 1rem;
}
code {
  font-size: 0.9em;
  padding: 0.0625rem 0.25rem;
  background: var(--paper);
  border-radius: var(--radius-tag);
}
.grid {
  display: grid;
  gap: 1rem;
}
.grid .card + .card {
  margin-top: 0;
}
.ro-note {
  margin: -0.5rem 0 0.75rem;
}
.vars {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0.375rem 0;
}
.var {
  font-family: ui-monospace, monospace;
  border: 1px dashed var(--input-line);
}
.preview-label {
  margin-top: 0.75rem;
}
.bubble {
  margin: 0.375rem 0 1rem;
  padding: 0.75rem 1rem;
  white-space: pre-line;
  overflow-wrap: anywhere;
  background: var(--page);
  border-radius: var(--radius-control) var(--radius-control) var(--radius-control) 2px;
}
@media (min-width: 960px) {
  .grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
</style>
