<script setup lang="ts">
// Avión de la señalética (decorativo). `rotate` en grados: 90 apunta a la derecha, 135 aterriza.
withDefaults(defineProps<{ rotate?: number }>(), { rotate: 90 })
</script>

<template>
  <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
    <path
      fill="currentColor"
      d="M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z"
      :transform="`rotate(${rotate} 12 12)`"
    />
  </svg>
</template>
