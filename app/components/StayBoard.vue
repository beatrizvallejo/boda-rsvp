<script setup lang="ts">
// Alojamiento y traslados: paneles negros (informan; nada editable) con lo que publican los novios en el
// panel. Cada parte sale cuando tiene contenido; mientras tanto sigue en «Próximamente».
import type { Stay } from '#shared/schemas'
import { pickNote, stayReady } from '#shared/stay'

const props = defineProps<{ stay: Stay }>()
const { t, locale } = useI18n()

const ready = computed(() => stayReady(props.stay))
const hotelsNote = computed(() => pickNote(props.stay.hotelsNote, locale.value))
const transfersNote = computed(() => pickNote(props.stay.transfersNote, locale.value))
const buses = computed(() => [...props.stay.buses].sort((a, b) => a.time.localeCompare(b.time)))

function km(value: number) {
  return t('stay.km', {
    km: new Intl.NumberFormat(locale.value === 'ro' ? 'ro-RO' : 'es-ES').format(value),
  })
}
</script>

<template>
  <div class="stay-wrap">
    <section v-if="ready.hotels" id="alojamiento" class="board" aria-labelledby="hotels-title">
      <p class="board__label" aria-hidden="true">
        <span class="board__emoji">🏨</span>
        {{ t('stay.hotelsBoard') }} <span>{{ t('stay.hotelsBoardAlt') }}</span>
      </p>
      <h2 id="hotels-title" class="board__title">{{ t('stay.hotelsTitle') }}</h2>
      <p v-if="hotelsNote" class="board__note">{{ hotelsNote }}</p>

      <ul v-if="stay.hotels.length" class="hotels">
        <li v-for="(hotel, index) in stay.hotels" :key="index" class="hotel">
          <p class="hotel__name">
            <b>{{ hotel.name }}</b>
            <span v-if="hotel.km !== null">{{ km(hotel.km) }}</span>
          </p>
          <p v-if="pickNote(hotel.note, locale)" class="hotel__note">
            {{ pickNote(hotel.note, locale) }}
          </p>
          <a
            v-if="hotel.url"
            class="board__link"
            :href="hotel.url"
            target="_blank"
            rel="noopener noreferrer"
            :aria-label="t('stay.visitLabel', { name: hotel.name })"
            >{{ t('stay.visit') }}</a
          >
        </li>
      </ul>
    </section>

    <section v-if="ready.transfers" id="traslados" class="board" aria-labelledby="transfers-title">
      <p class="board__label" aria-hidden="true">
        <span class="board__emoji">🚌</span>
        {{ t('stay.transfersBoard') }} <span>{{ t('stay.transfersBoardAlt') }}</span>
      </p>
      <h2 id="transfers-title" class="board__title">{{ t('stay.transfersTitle') }}</h2>
      <p v-if="transfersNote" class="board__note">{{ transfersNote }}</p>

      <template v-if="buses.length">
        <h3 class="buses__title">{{ t('stay.busDay') }}</h3>
        <ul class="buses">
          <li v-for="(bus, index) in buses" :key="index" class="bus">
            <span class="bus__time">{{ bus.time }}</span>
            <span class="bus__place">{{ bus.place }}</span>
          </li>
        </ul>
        <p class="board__foot">{{ t('stay.timeNote') }}</p>
      </template>
    </section>
  </div>
</template>

<style scoped>
.stay-wrap {
  display: grid;
  gap: 1rem;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem var(--gutter) 0;
}
.board {
  display: grid;
  gap: 0.5rem;
  padding: 1.75rem 1.5rem;
  color: var(--board-ink);
  background: var(--board-light), var(--board);
  border-radius: var(--radius-board);
  scroll-margin-top: 1rem;
}
.board__label {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 0.5rem;
  align-items: center;
  margin: 0 0 0.25rem;
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.board__label span:not(.board__emoji) {
  color: var(--board-muted);
}
.board__title {
  margin: 0.5rem 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
}
.board__note {
  margin: 0;
  padding-left: 0.75rem;
  color: var(--board-text);
  white-space: pre-line;
  border-left: 3px solid var(--signal);
}
.board__link {
  display: inline-flex;
  align-items: center;
  justify-self: start;
  min-height: 44px;
  padding: 0 1rem;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--board-ink);
  text-decoration: none;
  border: 1.5px solid var(--board-dash);
  border-radius: var(--radius-button);
}
.board__link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 2px;
}
.board__foot {
  margin: 0.25rem 0 0;
  font-size: var(--fs-small);
  color: var(--board-muted);
}

.hotels {
  display: grid;
  gap: 1.25rem;
  margin: 0.75rem 0 0;
  padding: 1.25rem 0 0;
  list-style: none;
  border-top: 1px solid var(--board-line);
}
.hotel {
  display: grid;
  align-content: start;
  gap: 0.5rem;
}
.hotel__name {
  display: grid;
  gap: 0.125rem;
  margin: 0;
}
.hotel__name b {
  font-size: 1.125rem;
  font-stretch: var(--stretch-tile);
  letter-spacing: 0.02em;
  overflow-wrap: anywhere;
}
.hotel__name span {
  font-size: var(--fs-small);
  color: var(--board-text-soft);
}
.hotel__note {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--board-text);
}

.buses__title {
  margin: 0.75rem 0 0;
  padding-top: 1.25rem;
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--board-muted);
  border-top: 1px solid var(--board-line);
}
.buses {
  display: grid;
  margin: 0;
  padding: 0;
  list-style: none;
}
.bus {
  display: grid;
  grid-template-columns: 4.5rem minmax(0, 1fr);
  gap: 0.75rem;
  align-items: baseline;
  padding: 0.625rem 0;
  border-bottom: 1px dashed var(--board-dash);
}
.bus__time {
  font-size: 1.25rem;
  font-weight: 700;
  font-stretch: var(--stretch-tile);
  font-variant-numeric: tabular-nums;
  color: var(--status-boarding);
}
.bus__place {
  overflow-wrap: anywhere;
}
@media (min-width: 720px) {
  .hotels {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
