<script setup lang="ts">
// Una invitación en el listado: tarjeta apilada en móvil, fila de tabla en escritorio.
import type { AdminInvitation, MessageKind } from '#shared/schemas'

const props = defineProps<{
  invitation: AdminInvitation
  /** Con el filtro «Vuelo conjunto», el botón principal es el aviso de vuelos. */
  flightsMode?: boolean
}>()

/** Pendiente ya invitada → recordatorio; si no, la invitación (resaltada mientras no se haya enviado). */
const kind = computed<MessageKind>(() =>
  props.flightsMode
    ? 'flights'
    : !props.invitation.rsvp && props.invitation.invitedSentAt
      ? 'reminder'
      : 'invitation',
)
const primary = computed(() => props.flightsMode || !props.invitation.rsvp)
const name = computed(() => props.invitation.rsvp?.guestName ?? props.invitation.guestName)
const JOINT_FLIGHT_SHORT = {
  yes: '✈ vuelo conjunto',
  no: 'sin vuelo conjunto',
}
</script>

<template>
  <article class="row" role="row">
    <div class="row__who" role="cell">
      <NuxtLink :to="`/admin/i/${invitation.id}`" class="row__name">{{ name }}</NuxtLink>
      <span class="row__meta">
        <span v-if="invitation.label">{{ invitation.label }} · </span>
        <span :lang="invitation.locale">{{ invitation.locale.toUpperCase() }}</span>
        <span v-if="!invitation.phone"> · sin teléfono</span>
      </span>
    </div>
    <div class="row__status" role="cell">
      <span v-if="invitation.rsvp" class="status status--confirmed">Confirmado</span>
      <span v-else class="status status--pending">Pendiente</span>
    </div>
    <div class="row__people" :class="{ 'row__people--empty': !invitation.rsvp }" role="cell">
      <template v-if="invitation.rsvp">
        {{ formatPeople(invitation.rsvp) }}
        <span v-if="invitation.rsvp.companionName" class="row__meta"
          >con {{ invitation.rsvp.companionName }}</span
        >
        <span v-if="invitation.rsvp.jointFlight" class="row__meta">{{
          JOINT_FLIGHT_SHORT[invitation.rsvp.jointFlight]
        }}</span>
      </template>
      <span v-else class="row__empty">—</span>
    </div>
    <div class="row__sent" role="cell">
      <span v-if="invitation.invitedSentAt">Enviada {{ formatDay(invitation.invitedSentAt) }}</span>
      <span v-else class="row__unsent">Sin enviar</span>
      <span v-if="invitation.reminderCount" class="row__meta">
        {{ plural(invitation.reminderCount, 'recordatorio', 'recordatorios') }}
      </span>
    </div>
    <div class="row__actions" role="cell">
      <AdminSendActions :invitation="invitation" :kind="kind" :primary="primary" />
    </div>
  </article>
</template>

<style scoped>
.row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.375rem 0.75rem;
  padding: 1rem;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
}
.row__who {
  display: grid;
  gap: 0.125rem;
  min-width: 0;
}
.row__name {
  font-weight: 800;
  color: var(--ink);
  overflow-wrap: anywhere;
  text-decoration-color: var(--signal);
  text-decoration-thickness: 3px;
  text-underline-offset: 3px;
}
.row__meta {
  display: block;
  font-size: var(--fs-small);
  color: var(--muted);
}
.row__people,
.row__sent {
  grid-column: 1 / -1;
  font-size: var(--fs-small);
}
.row__people .row__meta,
.row__sent .row__meta {
  display: inline;
}
.row__people .row__meta::before,
.row__sent .row__meta::before {
  content: ' · ';
}
.row__people--empty {
  display: none;
}
.row__empty {
  color: var(--muted);
}
.row__unsent {
  font-weight: 700;
  color: var(--pending-ink);
}
.row__actions {
  grid-column: 1 / -1;
  margin-top: 0.375rem;
}
@media (min-width: 960px) {
  .row {
    grid-template-columns: var(--admin-columns);
    gap: 1rem;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border-radius: 0;
    box-shadow: none;
    border-bottom: 1px solid var(--line);
  }
  .row:last-child {
    border-bottom: 0;
  }
  .row__people--empty {
    display: block;
  }
  .row__people,
  .row__sent,
  .row__actions {
    grid-column: auto;
    margin: 0;
  }
  .row__people .row__meta,
  .row__sent .row__meta {
    display: block;
  }
  .row__people .row__meta::before,
  .row__sent .row__meta::before {
    content: none;
  }
}
</style>
