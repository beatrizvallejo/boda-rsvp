<script setup lang="ts">
// Portada sin enlace personal: la tarjeta de embarque está en el enlace /r/<token> de cada invitado.
const { t } = useI18n()
</script>

<template>
  <PublicPage>
    <PublicNotice :title="t('home.title')" :text="t('home.text')" />
  </PublicPage>
</template>
