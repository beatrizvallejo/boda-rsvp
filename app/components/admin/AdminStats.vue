<script setup lang="ts">
// Métricas del panel sobre un panel negro (el panel informa; nada editable aquí).
import type { Stats } from '#shared/schemas'

defineProps<{ stats: Stats }>()
</script>

<template>
  <section class="stats" aria-label="Resumen">
    <div class="stats__cell">
      <span class="stats__label">Confirmadas</span>
      <span class="stats__value"
        >{{ stats.invitations.confirmed }}<small> / {{ stats.invitations.total }}</small></span
      >
      <span class="stats__note">{{ stats.invitations.pending }} pendientes</span>
    </div>
    <div class="stats__cell">
      <span class="stats__label">Personas a bordo</span>
      <span class="stats__value">{{ stats.people.confirmed }}</span>
      <span class="stats__note">{{ stats.adults }} adultos · {{ stats.children }} niños</span>
    </div>
    <div class="stats__cell">
      <span class="stats__label">Por confirmar</span>
      <span class="stats__value">{{ stats.people.pending }}</span>
      <span class="stats__note">personas (sin contar acompañantes)</span>
    </div>
    <div class="stats__cell">
      <span class="stats__label">WhatsApp</span>
      <span class="stats__value">{{ stats.whatsapp.invitationsSent }}<small> enviadas</small></span>
      <span class="stats__note"
        >{{ stats.whatsapp.invitationsNotSent }} sin enviar ·
        {{ stats.whatsapp.remindersSent }} recordatorios</span
      >
    </div>
  </section>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  overflow: hidden;
  color: var(--board-ink);
  background: var(--board-line);
  border-radius: var(--radius-board);
}
.stats__cell {
  display: grid;
  align-content: start;
  gap: 0.125rem;
  padding: 0.875rem 1rem;
  background: var(--board-light), var(--board);
}
.stats__label {
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--board-muted);
}
.stats__value {
  font-size: 2rem;
  font-weight: 700;
  font-stretch: var(--stretch-tile);
  line-height: 1.1;
  font-variant-numeric: tabular-nums;
}
.stats__value small {
  font-size: 1rem;
  color: var(--board-muted);
}
.stats__note {
  font-size: var(--fs-small);
  color: var(--board-muted);
}
@media (min-width: 960px) {
  .stats {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}
</style>
