<script setup lang="ts">
// Logo de "aerolínea" KR: insignia negra con las letras en cursiva ancha y una estela amarilla de
// despegue. Las letras son trazos (no texto) para que se vea igual en el favicon (public/favicon.svg).
// Tamaño: 36px por defecto (width/height del SVG, como en la cabecera); quien lo usa lo fija con su clase.
// Sin width: 100% propio: si este CSS llega antes que el del contenedor, el logo se ve gigante.
</script>

<template>
  <svg class="airline-logo" viewBox="0 0 64 64" width="36" height="36" aria-hidden="true">
    <circle cx="32" cy="32" r="32" fill="#121212" />
    <path d="M6 49 Q31 62 58 44 Q31 56.5 6 49Z" fill="#ffc629" />
    <g transform="translate(5.5 0) skewX(-12)" fill="#fff">
      <path d="M13 17H20V28.5L28.5 17H36.5L26.2 30.4L37 47H29L21.6 35.2L20 37.2V47H13Z" />
      <path
        fill-rule="evenodd"
        d="M38 17H47.5C53.5 17 56.5 20.6 56.5 25.6C56.5 29.4 54.6 32.1 51.4 33.3L57 47H49.4L44.8 34.4H45V47H38ZM45 22.8V28.8H47.2C49 28.8 49.7 27.7 49.7 25.8C49.7 23.9 49 22.8 47.2 22.8Z"
      />
    </g>
  </svg>
</template>

<style scoped>
.airline-logo {
  display: block;
}
</style>
