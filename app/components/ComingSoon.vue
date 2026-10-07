<script setup lang="ts">
// "Próximamente": vuelos, alojamiento y traslados. Tarjeta negra de panel con el estado en fichas.
const { t } = useI18n()
</script>

<template>
  <section id="pronto" class="soon-wrap" aria-labelledby="soon-title">
    <div class="soon">
      <div class="soon__status">
        <span class="soon__dot" aria-hidden="true" />
        <FlapText :text="t('soon.status')" :spins="[6, 12]" />
      </div>
      <h2 id="soon-title" class="soon__title">{{ t('soon.title') }}</h2>
      <p class="soon__text">{{ t('soon.text') }}</p>
      <ul class="soon__list">
        <li>
          <span aria-hidden="true">✈️</span>
          <span
            ><b>{{ t('soon.flights') }}</b> {{ t('soon.flightsText') }}</span
          >
        </li>
        <li>
          <span aria-hidden="true">🏨</span>
          <span
            ><b>{{ t('soon.hotels') }}</b> {{ t('soon.hotelsText') }}</span
          >
        </li>
        <li>
          <span aria-hidden="true">🚌</span>
          <span
            ><b>{{ t('soon.transfers') }}</b> {{ t('soon.transfersText') }}</span
          >
        </li>
      </ul>
      <p class="soon__foot">{{ t('soon.foot') }}</p>
    </div>
  </section>
</template>

<style scoped>
.soon-wrap {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem var(--gutter) 1rem;
  scroll-margin-top: 1rem;
}
.soon {
  display: grid;
  gap: 0.5rem;
  padding: 1.75rem 1.5rem;
  color: var(--board-ink);
  background: var(--board-light), var(--board);
  border-radius: var(--radius-board);
}
.soon__status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: min(1.25rem, calc((100vw - 6rem) / 13));
  color: var(--status-boarding);
}
.soon__dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
  animation: blink 1.4s steps(2, jump-none) infinite;
}
@keyframes blink {
  50% {
    opacity: 0.2;
  }
}
.soon__title {
  margin: 0.75rem 0 0;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
}
.soon__text {
  margin: 0;
  font-size: var(--fs-input);
  color: var(--board-text);
}
.soon__list {
  display: grid;
  gap: 0.875rem;
  margin: 1.25rem 0 0;
  padding: 1.25rem 0 0;
  list-style: none;
  border-top: 1px solid var(--board-line);
}
.soon__list li {
  display: grid;
  grid-template-columns: 2rem 1fr;
  gap: 0.75rem;
  align-items: start;
  color: var(--board-text-soft);
}
.soon__list li > span:first-child {
  font-size: 1.375rem;
  line-height: 1.2;
}
.soon__list b {
  display: block;
  color: var(--board-ink);
}
.soon__foot {
  margin: 1.25rem 0 0;
  font-size: var(--fs-small);
  color: var(--status-boarding);
}
</style>
