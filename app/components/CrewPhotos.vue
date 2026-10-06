<script setup lang="ts">
// Las fotos de los novios al final de la página: una tira de fotomatón en blanco y negro, pegada
// con cinta. Horizontal en escritorio, vertical en móvil. Fotos en public/fotos/ (600×600).
const { t } = useI18n()
const photos = [1, 2, 3, 4].map((n) => ({ src: `/fotos/boda-${n}.jpg`, alt: `crew.photo${n}` }))
</script>

<template>
  <section class="crew" :aria-label="t('crew.label')">
    <div class="booth">
      <span class="booth__tape" aria-hidden="true" />
      <img
        v-for="photo in photos"
        :key="photo.src"
        class="booth__photo"
        :src="photo.src"
        :alt="t(photo.alt)"
        width="600"
        height="600"
        loading="lazy"
        decoding="async"
      />
      <p class="booth__caption" aria-hidden="true">KR3107 · 31·07·27 · ALBA</p>
    </div>
  </section>
</template>

<style scoped>
.crew {
  display: grid;
  gap: 1.5rem;
  justify-items: center;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 3rem var(--gutter) 4rem;
}
.booth {
  position: relative;
  display: grid;
  gap: 10px;
  width: min(74vw, 270px);
  padding: 12px 12px 8px;
  background: #fbfbf8;
  box-shadow:
    0 2px 4px rgb(0 0 0 / 0.12),
    0 24px 40px -20px rgb(0 0 0 / 0.45);
  transform: rotate(-2deg);
}
@media (min-width: 720px) {
  .booth {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    width: min(100%, 64rem);
    padding: 14px 14px 8px;
    transform: rotate(-1.5deg);
  }
  .booth__caption {
    grid-column: 1 / -1;
  }
}
.booth__photo {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 1;
  object-fit: cover;
  filter: grayscale(1) contrast(1.15) brightness(1.03);
}
.booth__tape {
  position: absolute;
  top: -14px;
  left: 50%;
  width: 90px;
  height: 28px;
  background: rgb(255 236 170 / 0.75);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.1);
  transform: translateX(-50%) rotate(4deg);
}
.booth__caption {
  margin: 0;
  text-align: center;
  font-size: 0.6875rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  color: #6b6b6b;
}
</style>
