<script setup lang="ts">
// Vuelos: panel de SALIDAS sobre negro con el estado de la reserva conjunta en fichas, las rutas desde
// Madrid y enlaces de búsqueda ya rellenos (sin APIs de precios). Lo editan los novios en el panel.
// Solo se muestra con un estado distinto de «Próximamente» (entonces se ve el banner de siempre).
import type { Flights } from '#shared/schemas'
import {
  FLIGHT_DESTINATIONS,
  FLIGHT_ORIGIN,
  FLIGHT_SEARCHES,
  formatFlightDay,
} from '#shared/flights'

const props = defineProps<{ flights: Flights }>()
const { t, locale } = useI18n()
const lang = computed(() => (locale.value === 'ro' ? 'ro' : 'es'))

type ActiveStatus = Exclude<Flights['status'], 'soon'>
const status = computed(() => props.flights.status as ActiveStatus)
const statusText = computed(() =>
  t(`flights.statusText.${status.value}`, {
    date: props.flights.openUntil ? formatFlightDay(props.flights.openUntil, locale.value) : '',
  }),
)
const note = computed(() => props.flights.note[locale.value === 'ro' ? 'ro' : 'es'])
const price = computed(() => {
  const p = props.flights.lastPrice
  return p
    ? t('flights.lastPrice', { amount: p.amount, date: formatFlightDay(p.seenOn, locale.value) })
    : ''
})
const dates = computed(() =>
  t('flights.dates', {
    outbound: formatFlightDay(props.flights.outbound, locale.value),
    inbound: formatFlightDay(props.flights.inbound, locale.value),
  }),
)
const cityName = (city: string) => city.charAt(0) + city.slice(1).toLowerCase()
</script>

<template>
  <section id="vuelos" class="flights-wrap" aria-labelledby="flights-title">
    <div class="flights">
      <p class="flights__board" aria-hidden="true">
        <PlaneIcon :rotate="45" class="flights__icon" />
        {{ t('flights.board') }} <span>{{ t('flights.boardAlt') }}</span>
      </p>
      <div class="flights__status" :class="`is-${status}`">
        <span class="flights__dot" aria-hidden="true" />
        <FlapText :text="t(`flights.status.${status}`)" :length="18" :spins="[4, 9]" />
        <span class="sr-only">{{ t(`flights.status.${status}`) }}</span>
      </div>
      <h2 id="flights-title" class="flights__title">{{ t('flights.title') }}</h2>
      <p class="flights__text">{{ statusText }}</p>
      <p v-if="note" class="flights__note">{{ note }}</p>
      <p v-if="price" class="flights__price">{{ price }}</p>

      <ul class="flights__routes">
        <li v-for="d in FLIGHT_DESTINATIONS" :key="d.code" class="route">
          <p class="route__name">
            <b>{{ t('flights.route', { from: FLIGHT_ORIGIN.city, to: d.city }) }}</b>
            <span
              >{{ FLIGHT_ORIGIN.code }} → {{ d.code }} · {{ t('flights.km', { km: d.km }) }}</span
            >
          </p>
          <div class="route__links">
            <a
              v-for="s in FLIGHT_SEARCHES"
              :key="s.name"
              class="route__link"
              :href="s.url(d.code, flights.outbound, flights.inbound, lang)"
              target="_blank"
              rel="noopener"
              :aria-label="`${t('flights.search', { city: cityName(d.city) })} · ${s.name}`"
              >{{ s.name }}</a
            >
          </div>
        </li>
      </ul>
      <p class="flights__dates">{{ dates }}</p>
    </div>
  </section>
</template>

<style scoped>
.flights-wrap {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem var(--gutter) 0;
  scroll-margin-top: 1rem;
}
.flights {
  display: grid;
  gap: 0.5rem;
  padding: 1.75rem 1.5rem;
  color: var(--board-ink);
  background: var(--board-light), var(--board);
  border-radius: var(--radius-board);
}
.flights__board {
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
.flights__board span {
  color: var(--board-muted);
}
.flights__icon {
  width: 1rem;
  height: 1rem;
}
.flights__status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: min(1.25rem, calc((100vw - 6rem) / 20));
}
.flights__status.is-watching {
  color: var(--status-boarding);
}
.flights__status.is-open {
  color: var(--status-on-time);
}
.flights__status.is-closed {
  color: var(--board-muted);
}
.flights__dot {
  flex: none;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: blink 1.4s steps(2, jump-none) infinite;
}
.is-closed .flights__dot {
  animation: none;
}
@keyframes blink {
  50% {
    opacity: 0.2;
  }
}
.flights__title {
  margin: 0.75rem 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
}
.flights__text,
.flights__note,
.flights__price {
  margin: 0;
  color: var(--board-text);
}
.flights__text {
  font-size: var(--fs-input);
}
.flights__note {
  padding-left: 0.75rem;
  border-left: 3px solid var(--signal);
}
.flights__price {
  font-weight: 700;
  color: var(--board-ink);
}
.flights__routes {
  display: grid;
  gap: 1rem;
  margin: 0.75rem 0 0;
  padding: 1.25rem 0 0;
  list-style: none;
  border-top: 1px solid var(--board-line);
}
.route {
  display: grid;
  gap: 0.5rem;
}
.route__name {
  display: grid;
  gap: 0.125rem;
  margin: 0;
}
.route__name b {
  font-size: 1.125rem;
  font-stretch: var(--stretch-tile);
  letter-spacing: 0.04em;
}
.route__name span {
  font-size: var(--fs-small);
  color: var(--board-text-soft);
}
.route__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.route__link {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 1rem;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--board-ink);
  text-decoration: none;
  border: 1.5px solid var(--board-dash);
  border-radius: var(--radius-button);
}
.route__link:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 2px;
}
.flights__dates {
  margin: 0.5rem 0 0;
  font-size: var(--fs-small);
  color: var(--board-muted);
}
@media (min-width: 720px) {
  .flights__routes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
