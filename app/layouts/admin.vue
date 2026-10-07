<script setup lang="ts">
// Panel de los novios: sobrio, derivado de los tokens. Solo en español (lo usan los novios).
import type { AdminSession } from '#shared/schemas'

const session = useState<AdminSession | null>('admin-session', () => null)
const route = useRoute()

useHead({ htmlAttrs: { lang: 'es-ES' }, title: 'Panel · Keko y Ro' })

const nav = [
  { to: '/admin', label: 'Invitados' },
  { to: '/admin/nueva', label: 'Añadir' },
  { to: '/admin/plantillas', label: 'Mensajes' },
]

function isActive(to: string) {
  return to === '/admin'
    ? route.path === '/admin' || route.path.startsWith('/admin/i/')
    : route.path === to
}

async function logout() {
  await $fetch('/api/auth/logout', { method: 'POST' })
  session.value = null
  await navigateTo('/admin/login')
}
</script>

<template>
  <div class="admin">
    <header class="admin-header">
      <div class="admin-header__bar">
        <NuxtLink to="/admin" class="admin-header__brand">
          <AirlineLogo class="admin-header__logo" />
          <span>Keko y Ro <span class="admin-header__sub">· Panel</span></span>
        </NuxtLink>
        <button
          v-if="session?.method === 'password'"
          type="button"
          class="btn btn--ghost btn--small"
          @click="logout"
        >
          Salir
        </button>
      </div>
      <nav v-if="session" class="admin-nav" aria-label="Secciones del panel">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="admin-nav__item"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>
    </header>
    <main class="admin-main">
      <slot />
    </main>
    <AdminToast />
  </div>
</template>

<style>
/* Primitivas del panel (sin `scoped`: las comparten todas las páginas de /admin). */
.admin {
  /* Columnas de la tabla de invitaciones en escritorio (cabecera y filas) */
  --admin-columns: minmax(0, 2fr) 7.5rem minmax(0, 1.4fr) minmax(0, 1.2fr) 23rem;
  min-height: 100vh;
  min-height: 100dvh;
}
.admin-main {
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 1rem var(--gutter) calc(2.5rem + env(safe-area-inset-bottom));
}
.admin h1 {
  margin: 0.5rem 0 1rem;
  font-size: var(--fs-section);
  font-weight: 800;
  font-stretch: var(--stretch-tile);
  line-height: 1.1;
}
.admin h2 {
  margin: 0 0 0.75rem;
  font-size: var(--fs-lead);
  font-weight: 800;
  font-stretch: var(--stretch-tile);
}
.admin .muted {
  color: var(--muted);
}

.card {
  padding: 1.25rem;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
}
.card + .card {
  margin-top: 1rem;
}

/* Botones: 44px mínimo, amarillo señal solo para la acción principal */
.btn {
  display: inline-flex;
  gap: 0.375rem;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0.5rem 1rem;
  font-size: 0.9375rem;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-button);
}
.btn--primary {
  background: var(--signal);
  border-color: var(--signal);
  color: var(--on-signal);
}
.btn--ghost {
  border-color: transparent;
  background: transparent;
}
.btn--danger {
  color: var(--error);
  border-color: var(--error);
}
.btn--small {
  min-height: 44px;
  padding-inline: 0.75rem;
  font-size: var(--fs-small);
}
.btn:disabled {
  cursor: default;
  opacity: 0.45;
}
.btn:focus-visible,
.input:focus-visible,
.chip:focus-visible,
.segmented button:focus-visible,
.admin-nav__item:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 2px;
}
.btn-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

/* Campos: label real encima, 17px (sin zoom en iOS) */
.field {
  display: grid;
  gap: 0.375rem;
}
.field + .field {
  margin-top: 0.875rem;
}
.input {
  width: 100%;
  min-height: 48px;
  padding: 0.625rem 0.75rem;
  font-size: var(--fs-input);
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--input-line);
  border-radius: var(--radius-control);
}
textarea.input {
  min-height: 8rem;
  resize: vertical;
  line-height: 1.45;
}
.input[aria-invalid='true'] {
  border-color: var(--error);
}
.field-error {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--error);
}
.hint {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--muted);
}

/* Selector segmentado (ES / RO, Solo / Acompañado) */
.segmented {
  display: inline-flex;
  padding: 3px;
  background: var(--line);
  border-radius: var(--radius-control);
}
.segmented button {
  min-width: 56px;
  min-height: 42px;
  padding: 0 0.875rem;
  font-weight: 700;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 8px;
}
.segmented button[aria-pressed='true'] {
  color: var(--ink);
  background: var(--paper);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
}

/* Estado de una invitación */
.status {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-radius: 999px;
}
.status--confirmed {
  color: var(--confirmed-ink);
  background: var(--confirmed-bg);
}
.status--pending {
  color: var(--pending-ink);
  background: var(--pending-bg);
}

/* Aviso breve tras una acción */
.toast {
  position: fixed;
  left: 50%;
  bottom: calc(1rem + env(safe-area-inset-bottom));
  z-index: 10;
  max-width: calc(100vw - 2 * var(--gutter));
  padding: 0.75rem 1rem;
  font-weight: 700;
  color: var(--board-ink);
  background: var(--board);
  border-radius: var(--radius-button);
  transform: translateX(-50%);
}
</style>

<style scoped>
.admin-header {
  background: var(--paper);
  border-bottom: 1px solid var(--line);
}
.admin-header__bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0.5rem var(--gutter);
}
.admin-header__brand {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  min-height: 44px;
  font-weight: 800;
  color: var(--ink);
  text-decoration: none;
}
.admin-header__logo {
  width: 2rem;
  height: 2rem;
}
.admin-header__sub {
  font-weight: 400;
  color: var(--muted);
}
.admin-nav {
  display: flex;
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--gutter);
}
.admin-nav__item {
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  font-size: var(--fs-small);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
  text-decoration: none;
  border-bottom: 3px solid transparent;
}
.admin-nav__item[aria-current='page'] {
  color: var(--ink);
  border-bottom-color: var(--signal);
}
@media (min-width: 720px) {
  .admin-nav__item {
    flex: 0 0 auto;
    padding: 0 1.25rem;
  }
}
</style>
