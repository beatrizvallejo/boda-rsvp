<script setup lang="ts">
// `lang` del documento según el idioma activo (también en el servidor, tras fijar el de la invitación).
const { locale, locales } = useI18n()
useHead({
  htmlAttrs: {
    lang: () => locales.value.find((l) => l.code === locale.value)?.language ?? locale.value,
  },
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
