<script setup lang="ts">
// Ficha de una invitación: envío, datos de la invitación, respuesta (registrar, corregir o quitar) y borrado.
import {
  invitationUpdateSchema,
  normalizePhone,
  rsvpInputSchema,
  type AdminInvitation,
  type InvitationUpdate,
} from '#shared/schemas'
import type { InvitationForm } from '~/components/admin/InvitationFields.vue'

definePageMeta({ layout: 'admin', middleware: 'admin' })

const route = useRoute()
const { data: invitations, refresh, status } = useAdminInvitations()
useAdminTemplates()
const send = useSend()
const toast = useToast()

const invitation = computed<AdminInvitation | undefined>(() =>
  invitations.value.find((i) => i.id === route.params.id),
)
const labels = useAdminLabels()

// ── Datos de la invitación ───────────────────────────────────────────────
const form = ref<InvitationForm>({ guestName: '', locale: 'es', phone: '', label: '' })
const formError = ref<FieldError | null>(null)
const savingInvitation = ref(false)

function resetForm() {
  const i = invitation.value
  if (!i) return
  form.value = { guestName: i.guestName, locale: i.locale, phone: i.phone ?? '', label: i.label }
  formError.value = null
}
watch(invitation, (now, before) => now && now.id !== before?.id && resetForm(), { immediate: true })

const patch = computed<InvitationUpdate>(() => {
  const i = invitation.value
  if (!i) return {}
  const changes: InvitationUpdate = {}
  if (form.value.guestName.trim() !== i.guestName) changes.guestName = form.value.guestName
  if (form.value.locale !== i.locale) changes.locale = form.value.locale
  if (normalizePhone(form.value.phone) !== (i.phone ?? '')) changes.phone = form.value.phone
  if (form.value.label.trim() !== i.label) changes.label = form.value.label
  return changes
})
const invitationChanged = computed(() => Object.keys(patch.value).length > 0)

async function saveInvitation() {
  formError.value = null
  const parsed = invitationUpdateSchema.safeParse(patch.value)
  if (!parsed.success) {
    formError.value = firstFieldError(parsed.error, INVITATION_MESSAGES)
    void focusFirstError()
    return
  }
  savingInvitation.value = true
  try {
    await adminFetch(`/api/admin/invitations/${invitation.value!.id}`, {
      method: 'PATCH',
      body: parsed.data,
    })
    await refresh()
    resetForm()
    toast.show('Invitación guardada')
  } catch {
    toast.show('No se ha podido guardar. Inténtalo otra vez.')
  } finally {
    savingInvitation.value = false
  }
}

// ── Respuesta ────────────────────────────────────────────────────────────
const editingRsvp = ref(false)
const COMPANION_OPTIONS = [
  { value: false, label: 'Solo/a' },
  { value: true, label: 'Acompañado/a' },
]
const rsvpForm = reactive({
  guestName: '',
  withCompanion: false,
  companionName: '',
  children: 0,
  email: '',
})
const rsvpError = ref<FieldError | null>(null)
const savingRsvp = ref(false)

function startRsvp() {
  const i = invitation.value!
  const r = i.rsvp
  Object.assign(rsvpForm, {
    guestName: r?.guestName ?? i.guestName,
    withCompanion: !!r?.companionName,
    companionName: r?.companionName ?? '',
    children: r?.children ?? 0,
    email: r?.email ?? '',
  })
  rsvpError.value = null
  editingRsvp.value = true
}

async function saveRsvp() {
  rsvpError.value = null
  if (rsvpForm.withCompanion && !rsvpForm.companionName.trim()) {
    rsvpError.value = { field: 'companionName', message: RSVP_MESSAGES.companionName! }
    void focusFirstError()
    return
  }
  const parsed = rsvpInputSchema.safeParse({
    guestName: rsvpForm.guestName,
    companionName: rsvpForm.withCompanion ? rsvpForm.companionName : null,
    children: rsvpForm.children,
    email: rsvpForm.email,
  })
  if (!parsed.success) {
    rsvpError.value = firstFieldError(parsed.error, RSVP_MESSAGES)
    void focusFirstError()
    return
  }
  savingRsvp.value = true
  try {
    await adminFetch(`/api/admin/invitations/${invitation.value!.id}/rsvp`, {
      method: 'PUT',
      body: parsed.data,
    })
    await refresh()
    editingRsvp.value = false
    toast.show('Respuesta guardada')
  } catch {
    toast.show('No se ha podido guardar. Inténtalo otra vez.')
  } finally {
    savingRsvp.value = false
  }
}

async function removeRsvp() {
  const i = invitation.value!
  if (
    !confirm(
      `¿Quitar la confirmación de ${i.rsvp?.guestName ?? i.guestName}? Volverá a estar pendiente.`,
    )
  )
    return
  try {
    await adminFetch(`/api/admin/invitations/${i.id}/rsvp`, { method: 'DELETE' })
    await refresh()
    editingRsvp.value = false
    toast.show('Confirmación quitada')
  } catch {
    toast.show('No se ha podido quitar. Inténtalo otra vez.')
  }
}

// ── Borrado ──────────────────────────────────────────────────────────────
async function removeInvitation() {
  const i = invitation.value!
  if (
    !confirm(
      `¿Borrar la invitación de ${i.guestName}? Se borra también su respuesta y el enlace deja de funcionar.`,
    )
  )
    return
  try {
    await adminFetch(`/api/admin/invitations/${i.id}`, { method: 'DELETE' })
    await refresh()
    toast.show('Invitación borrada')
    await navigateTo('/admin')
  } catch {
    toast.show('No se ha podido borrar. Inténtalo otra vez.')
  }
}

async function copy() {
  toast.show(
    (await send.copyLink(invitation.value!)) ? 'Enlace copiado' : 'No se ha podido copiar.',
  )
}
</script>

<template>
  <div class="detail">
    <NuxtLink to="/admin" class="back">← Invitados</NuxtLink>

    <p v-if="!invitation && status === 'pending'" class="muted">Cargando…</p>
    <div v-else-if="!invitation" class="card">
      <p>Esta invitación no existe (quizá se ha borrado).</p>
      <NuxtLink to="/admin" class="btn">Volver al listado</NuxtLink>
    </div>

    <template v-else>
      <header class="detail__head">
        <h1>{{ invitation.guestName }}</h1>
        <span v-if="invitation.rsvp" class="status status--confirmed">Confirmado</span>
        <span v-else class="status status--pending">Pendiente</span>
      </header>

      <div class="detail__grid">
        <section class="card" aria-labelledby="send-title">
          <h2 id="send-title">Enviar</h2>
          <div class="link">
            <span class="label">Enlace personal</span>
            <a :href="send.link(invitation)" target="_blank" rel="noopener" class="link__url">{{
              send.link(invitation)
            }}</a>
            <button type="button" class="btn btn--small" @click="copy">Copiar enlace</button>
          </div>

          <h3 class="label send-kind">Invitación</h3>
          <p class="hint">
            {{
              invitation.invitedSentAt
                ? `Enviada el ${formatDateTime(invitation.invitedSentAt)}`
                : 'Aún sin enviar.'
            }}
          </p>
          <AdminSendActions
            :invitation="invitation"
            kind="invitation"
            no-copy
            :primary="!invitation.invitedSentAt"
          />

          <template v-if="!invitation.rsvp">
            <h3 class="label send-kind">Recordatorio</h3>
            <p class="hint">
              {{
                invitation.reminderCount
                  ? `${plural(invitation.reminderCount, 'recordatorio enviado', 'recordatorios enviados')}; el último, el ${formatDateTime(invitation.reminderSentAt!)}`
                  : 'Ningún recordatorio enviado.'
              }}
            </p>
            <AdminSendActions
              :invitation="invitation"
              kind="reminder"
              no-copy
              :primary="!!invitation.invitedSentAt"
            />
          </template>
          <details class="preview">
            <summary>Ver el mensaje</summary>
            <p class="preview__bubble">
              {{
                send.message(
                  invitation,
                  invitation.rsvp || !invitation.invitedSentAt ? 'invitation' : 'reminder',
                )
              }}
            </p>
          </details>
          <p class="hint">
            El envío se marca al pulsar el botón: es orientativo, WhatsApp no confirma la entrega.
          </p>
        </section>

        <section class="card" aria-labelledby="rsvp-title">
          <h2 id="rsvp-title">Respuesta</h2>

          <form v-if="editingRsvp" novalidate @submit.prevent="saveRsvp">
            <label class="field">
              <span class="label">Pasajero</span>
              <input
                v-model="rsvpForm.guestName"
                class="input"
                autocomplete="off"
                :aria-invalid="rsvpError?.field === 'guestName' || undefined"
              />
              <span v-if="rsvpError?.field === 'guestName'" class="field-error" role="alert">{{
                rsvpError.message
              }}</span>
            </label>
            <AdminSegmented
              v-model="rsvpForm.withCompanion"
              label="Acompañante"
              :options="COMPANION_OPTIONS"
            />
            <label v-if="rsvpForm.withCompanion" class="field">
              <span class="label">Nombre del acompañante</span>
              <input
                v-model="rsvpForm.companionName"
                class="input"
                autocomplete="off"
                :aria-invalid="rsvpError?.field === 'companionName' || undefined"
              />
              <span v-if="rsvpError?.field === 'companionName'" class="field-error" role="alert">{{
                rsvpError.message
              }}</span>
            </label>
            <label class="field">
              <span class="label">Niños</span>
              <input
                v-model.number="rsvpForm.children"
                class="input input--short"
                type="number"
                inputmode="numeric"
                min="0"
                max="10"
                :aria-invalid="rsvpError?.field === 'children' || undefined"
              />
              <span v-if="rsvpError?.field === 'children'" class="field-error" role="alert">{{
                rsvpError.message
              }}</span>
            </label>
            <label class="field">
              <span class="label">Email (opcional)</span>
              <input
                v-model="rsvpForm.email"
                class="input"
                type="email"
                autocomplete="off"
                :aria-invalid="rsvpError?.field === 'email' || undefined"
              />
              <span v-if="rsvpError?.field === 'email'" class="field-error" role="alert">{{
                rsvpError.message
              }}</span>
            </label>
            <p class="hint">
              Los cambios desde el panel no envían aviso por email y valen aunque haya pasado el
              plazo.
            </p>
            <div class="btn-row actions">
              <button type="submit" class="btn btn--primary" :disabled="savingRsvp">
                {{ invitation.rsvp ? 'Guardar respuesta' : 'Registrar confirmación' }}
              </button>
              <button type="button" class="btn btn--ghost" @click="editingRsvp = false">
                Cancelar
              </button>
            </div>
          </form>

          <template v-else-if="invitation.rsvp">
            <dl class="facts">
              <div>
                <dt class="label">Pasajero</dt>
                <dd>{{ invitation.rsvp.guestName }}</dd>
              </div>
              <div>
                <dt class="label">Acompañante</dt>
                <dd>{{ invitation.rsvp.companionName ?? 'Viaja solo/a' }}</dd>
              </div>
              <div>
                <dt class="label">Personas</dt>
                <dd>{{ formatPeople(invitation.rsvp) }}</dd>
              </div>
              <div>
                <dt class="label">Email</dt>
                <dd>{{ invitation.rsvp.email ?? '—' }}</dd>
              </div>
              <div>
                <dt class="label">Última respuesta</dt>
                <dd>
                  {{ formatDateTime(invitation.rsvp.updatedAt) }}
                  {{ invitation.rsvp.updatedBy === 'admin' ? '(desde el panel)' : '' }}
                </dd>
              </div>
            </dl>
            <div class="btn-row actions">
              <button type="button" class="btn" @click="startRsvp">Editar respuesta</button>
              <button type="button" class="btn btn--danger" @click="removeRsvp">
                Quitar confirmación
              </button>
            </div>
          </template>

          <template v-else>
            <p class="muted">Aún no ha confirmado.</p>
            <p class="hint">¿Os ha confirmado por otra vía? Registradlo aquí.</p>
            <div class="btn-row actions">
              <button type="button" class="btn" @click="startRsvp">Registrar confirmación</button>
            </div>
          </template>
        </section>

        <section class="card" aria-labelledby="data-title">
          <h2 id="data-title">Datos de la invitación</h2>
          <form novalidate @submit.prevent="saveInvitation">
            <AdminInvitationFields
              v-model="form"
              :error="formError"
              :labels="labels"
              locale-label="Idioma de la web y del mensaje"
              phone-hint="Con prefijo del país. Sin teléfono, WhatsApp te deja elegir el contacto."
            />
            <div class="btn-row actions">
              <button
                type="submit"
                class="btn btn--primary"
                :disabled="!invitationChanged || savingInvitation"
              >
                Guardar cambios
              </button>
              <button
                v-if="invitationChanged"
                type="button"
                class="btn btn--ghost"
                @click="resetForm"
              >
                Deshacer
              </button>
            </div>
          </form>
        </section>

        <section class="card danger" aria-labelledby="danger-title">
          <h2 id="danger-title">Borrar</h2>
          <p class="hint">Se borra la invitación y su respuesta, y el enlace deja de funcionar.</p>
          <button type="button" class="btn btn--danger actions" @click="removeInvitation">
            Borrar invitación
          </button>
        </section>
      </div>
    </template>
  </div>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
}
.detail__head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.75rem;
  align-items: center;
  margin-bottom: 1rem;
}
.detail__head h1 {
  margin: 0;
  overflow-wrap: anywhere;
}
.detail__grid {
  display: grid;
  gap: 1rem;
}
.detail__grid .card + .card {
  margin-top: 0;
}
.link {
  display: grid;
  gap: 0.375rem;
  justify-items: start;
}
.link__url {
  max-width: 100%;
  font-size: var(--fs-small);
  color: var(--ink);
  overflow-wrap: anywhere;
}
.send-kind {
  margin: 1.25rem 0 0.25rem;
}
.send-kind + .hint {
  margin-bottom: 0.5rem;
}
.preview {
  margin: 1.25rem 0 0.75rem;
}
.preview summary {
  min-height: 44px;
  display: flex;
  align-items: center;
  font-weight: 700;
  cursor: pointer;
}
.preview__bubble {
  margin: 0;
  padding: 0.75rem 1rem;
  white-space: pre-line;
  overflow-wrap: anywhere;
  background: var(--page);
  border-radius: var(--radius-control);
}
.facts {
  display: grid;
  gap: 0.75rem;
  margin: 0;
}
.facts dd {
  margin: 0.125rem 0 0;
  overflow-wrap: anywhere;
}
.input--short {
  max-width: 8rem;
}
.actions {
  margin-top: 1rem;
}
.danger .hint {
  margin-bottom: 0;
}
@media (min-width: 960px) {
  .detail__grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    align-items: start;
  }
}
</style>
