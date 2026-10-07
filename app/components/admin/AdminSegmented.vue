<script setup lang="ts" generic="T extends string | boolean">
// Selector segmentado del panel (ES / RO, Solo / Acompañado). El del billete es otro, a propósito.
defineProps<{ label: string; options: { value: T; label: string }[] }>()
const model = defineModel<T>({ required: true })
const id = useId()
</script>

<template>
  <div class="field">
    <span :id="id" class="label">{{ label }}</span>
    <div class="segmented" role="group" :aria-labelledby="id">
      <button
        v-for="option in options"
        :key="String(option.value)"
        type="button"
        :aria-pressed="model === option.value"
        @click="model = option.value"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
