<script setup lang="ts">
// Portada sin enlace personal: la tarjeta de embarque está en el enlace /r/<token> de cada invitado.
const { t } = useI18n()
</script>

<template>
  <PublicPage>
    <section class="notice" aria-labelledby="notice-title">
      <h1 id="notice-title" class="notice__title">{{ t('home.title') }}</h1>
      <p class="notice__text">{{ t('home.text') }}</p>
    </section>
  </PublicPage>
</template>

<style scoped>
.notice {
  max-width: 40rem;
  margin: 1.5rem auto 1rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
}
@media (max-width: 719px) {
  .notice {
    margin-inline: var(--gutter);
  }
}
.notice__title {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: 85%;
}
.notice__text {
  margin: 0;
  color: var(--muted);
}
</style>
