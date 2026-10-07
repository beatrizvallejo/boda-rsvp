<script setup lang="ts">
// Cabecera de la página: monograma, nombres y selector de idioma (ES/RO). Elegir idioma aquí lo marca
// como elección del invitado (`LOCALE_CHOSEN_COOKIE`): a partir de ahí manda sobre el de la invitación.
// `inert` mientras la intro tapa la página.
defineProps<{ inert?: boolean }>()
const { t, locale, locales, setLocale } = useI18n()
const chosen = useCookie(LOCALE_CHOSEN_COOKIE, { maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })

async function choose(code: (typeof locales.value)[number]['code']) {
  chosen.value = '1'
  await setLocale(code)
}
</script>

<template>
  <header class="site-header" :inert="inert">
    <span class="site-header__brand"
      ><AirlineLogo class="site-header__mono" /> {{ t('brand') }}</span
    >
    <nav class="site-header__lang" :aria-label="t('lang.label')">
      <button
        v-for="l in locales"
        :key="l.code"
        type="button"
        :aria-pressed="locale === l.code"
        :lang="l.language"
        @click="choose(l.code)"
      >
        {{ l.code.toUpperCase() }}
      </button>
    </nav>
  </header>
</template>

<style scoped>
.site-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1rem var(--gutter);
}
.site-header__brand {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 700;
}
.site-header__mono {
  width: 2.25rem;
  height: 2.25rem;
}
.site-header__lang {
  display: flex;
  gap: 0.25rem;
}
.site-header__lang button {
  min-width: 44px;
  min-height: 44px;
  font-size: 0.9375rem;
  letter-spacing: 0.04em;
  color: var(--muted);
  background: none;
  border: 0;
  border-radius: var(--radius-inner);
  cursor: pointer;
}
.site-header__lang button[aria-pressed='true'] {
  font-weight: 800;
  color: var(--ink);
}
.site-header__lang button:focus-visible {
  outline: 3px solid var(--signal);
}
</style>
