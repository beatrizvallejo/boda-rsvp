<script setup lang="ts">
const head = useLocaleHead()
useHead({ htmlAttrs: { lang: () => head.value.htmlAttrs?.lang } })
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <!-- Esqueleto: el diseño llega en la Fase 3 (skill wedding-design) -->
    <main>
      <h1>{{ $t('home.title') }}</h1>
    </main>
  </div>
</template>
