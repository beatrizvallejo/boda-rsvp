<script setup lang="ts">
// "Cómo llegar": tres carteles de señalética (lugar → mapa, Instagram del sitio, apertura y cierre).
import { VENUE } from '#shared/config'

const { t } = useI18n()
</script>

<template>
  <section class="howto" aria-labelledby="howto-title">
    <h2 id="howto-title" class="howto__title">{{ t('howto.title') }}</h2>
    <ul class="signs">
      <li>
        <a class="sign" :href="VENUE.mapsUrl" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7m0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5"
            />
          </svg>
          <span
            ><b>{{ t('howto.place') }}</b> {{ t('howto.placeLink', { name: VENUE.name }) }}</span
          >
          <span class="sign__arrow" aria-hidden="true">→</span>
        </a>
      </li>
      <li>
        <a class="sign" :href="VENUE.instagramUrl" target="_blank" rel="noopener">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9m0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M17.5 5.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
            />
          </svg>
          <span
            ><b>{{ t('howto.instagram') }}</b> {{ t('howto.instagramText') }}</span
          >
          <span class="sign__arrow" aria-hidden="true">→</span>
        </a>
      </li>
      <li>
        <div class="sign">
          <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
            <path
              fill="currentColor"
              fill-rule="evenodd"
              d="M12 1a11 11 0 1 0 0 22 11 11 0 0 0 0-22m0 2a9 9 0 1 1 0 18 9 9 0 0 1 0-18m1 3h-2v7.4l5 3 1-1.7-4-2.3z"
            />
          </svg>
          <dl class="sign__hours">
            <dt>{{ t('howto.open') }}</dt>
            <dd>13:00</dd>
            <dt>{{ t('howto.close') }}</dt>
            <dd>{{ t('howto.closeValue') }} <span aria-hidden="true">🕺</span></dd>
          </dl>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.howto {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem var(--gutter) 1rem;
}
.howto__title {
  margin: 0 0 1rem;
  font-size: var(--fs-section);
  font-weight: 800;
  font-stretch: var(--stretch-tile);
}
.signs {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 900px) {
  .signs {
    grid-template-columns: repeat(3, 1fr);
  }
}
.signs li {
  display: grid;
}
.sign {
  display: grid;
  grid-template-columns: 2.5rem 1fr auto;
  gap: 0.875rem;
  align-items: center;
  min-height: 4.5rem;
  padding: 0.875rem 1rem;
  color: var(--on-signal);
  text-decoration: none;
  background: var(--signal);
  border-radius: var(--radius-sign);
}
a.sign:hover {
  filter: brightness(1.04);
}
a.sign:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 3px;
}
.sign svg {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.375rem;
  border: 2px solid currentColor;
  border-radius: var(--radius-tag);
}
.sign b {
  display: block;
  font-size: 1.125rem;
  font-stretch: var(--stretch-tile);
  text-transform: uppercase;
}
.sign__arrow {
  font-size: 1.75rem;
  font-weight: 800;
}
.sign__hours {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.25rem 0.75rem;
  align-items: baseline;
  margin: 0;
}
.sign__hours dt {
  font-size: var(--fs-label);
  font-weight: 800;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.sign__hours dd {
  margin: 0;
  font-weight: 700;
}
.sign__hours small {
  font-size: 0.875em;
  font-weight: 400;
}
</style>
