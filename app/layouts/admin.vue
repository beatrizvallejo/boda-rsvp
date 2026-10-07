<script setup lang="ts">
import '~/assets/css/admin.css'
// Panel de los novios: sobrio, derivado de los tokens. Solo en español (lo usan los novios).

const session = useAdminSession()
const route = useRoute()

useHead({ htmlAttrs: { lang: 'es-ES' }, title: 'Panel · Keko y Ro' })

const nav = [
  { to: '/admin', label: 'Invitados' },
  { to: '/admin/nueva', label: 'Añadir' },
  { to: '/admin/plantillas', label: 'Mensajes' },
  { to: '/admin/vuelos', label: 'Vuelos' },
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
