<script setup lang="ts">
const { message } = useToast()
</script>

<template>
  <p v-if="message" class="toast" role="status">{{ message }}</p>
</template>
