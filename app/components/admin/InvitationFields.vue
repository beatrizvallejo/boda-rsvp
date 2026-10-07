<script setup lang="ts">
// Campos de una invitación (alta y ficha): nombre, idioma, teléfono y etiqueta, con el error junto
// al campo. El formulario, el envío y los botones los pone cada página.
import type { Locale } from '#shared/schemas'

export interface InvitationForm {
  guestName: string
  locale: Locale
  phone: string
  label: string
}

defineProps<{
  error: FieldError | null
  labels: string[]
  localeLabel?: string
  phoneHint?: string
}>()
const form = defineModel<InvitationForm>({ required: true })
const listId = useId()

const LOCALE_OPTIONS: { value: Locale; label: string }[] = [
  { value: 'es', label: 'ES' },
  { value: 'ro', label: 'RO' },
]
</script>

<template>
  <label class="field">
    <span class="label">Nombre</span>
    <input
      v-model="form.guestName"
      class="input"
      autocomplete="off"
      :aria-invalid="error?.field === 'guestName' || undefined"
    />
    <span v-if="error?.field === 'guestName'" class="field-error" role="alert">{{
      error.message
    }}</span>
  </label>
  <AdminSegmented
    v-model="form.locale"
    :label="localeLabel ?? 'Idioma'"
    :options="LOCALE_OPTIONS"
  />
  <label class="field">
    <span class="label">Teléfono (opcional)</span>
    <input
      v-model="form.phone"
      class="input"
      type="tel"
      inputmode="tel"
      autocomplete="off"
      placeholder="+34 600 111 222"
      :aria-invalid="error?.field === 'phone' || undefined"
    />
    <span v-if="error?.field === 'phone'" class="field-error" role="alert">{{
      error.message
    }}</span>
    <span v-if="phoneHint" class="hint">{{ phoneHint }}</span>
  </label>
  <label class="field">
    <span class="label">Etiqueta (opcional)</span>
    <input
      v-model="form.label"
      class="input"
      :list="listId"
      autocomplete="off"
      placeholder="Familia Ro, Amigos Keko…"
      :aria-invalid="error?.field === 'label' || undefined"
    />
    <span v-if="error?.field === 'label'" class="field-error" role="alert">{{
      error.message
    }}</span>
    <datalist :id="listId">
      <option v-for="l in labels" :key="l" :value="l" />
    </datalist>
  </label>
</template>
