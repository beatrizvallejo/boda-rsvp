<script setup lang="ts">
// Aviso en tarjeta blanca de las páginas públicas: portada sin enlace, enlace inválido, plazo cerrado.
defineProps<{ title: string; text: string }>()
const id = useId()
</script>

<template>
  <section class="notice" :aria-labelledby="id">
    <h1 :id="id" class="notice__title">{{ title }}</h1>
    <p class="notice__text">{{ text }}</p>
  </section>
</template>

<style scoped>
.notice {
  width: min(40rem, 100% - 2 * var(--gutter));
  margin: 1.5rem auto 1rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
}
.notice__title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
}
.notice__text {
  margin: 0;
  color: var(--muted);
}
</style>
