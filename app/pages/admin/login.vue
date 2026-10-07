<script setup lang="ts">
import type { AdminSession } from '#shared/schemas'

definePageMeta({ layout: 'admin' })

const session = useState<AdminSession | null>('admin-session', () => null)
const password = ref('')
const visible = ref(false)
const error = ref('')
const sending = ref(false)
const input = ref<HTMLInputElement>()

// Con sesión abierta (o el adaptador `dev`), directo al panel.
onMounted(async () => {
  try {
    session.value = await $fetch<AdminSession>('/api/admin/session')
    await navigateTo('/admin')
  } catch {
    input.value?.focus()
  }
})

async function submit() {
  error.value = ''
  if (!password.value) {
    error.value = 'Escribe la contraseña del panel.'
    input.value?.focus()
    return
  }
  sending.value = true
  try {
    await $fetch('/api/auth/login', { method: 'POST', body: { password: password.value } })
    session.value = await $fetch<AdminSession>('/api/admin/session')
    await navigateTo('/admin')
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode
    error.value =
      status === 401
        ? 'Contraseña incorrecta. Revisa mayúsculas y espacios.'
        : 'No hemos podido conectar. Comprueba la conexión e inténtalo otra vez.'
    password.value = ''
    input.value?.focus()
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <section class="login card" aria-labelledby="login-title">
    <AirlineLogo class="login__logo" />
    <h1 id="login-title">Panel de Keko y Ro</h1>
    <p class="muted login__text">Solo para la tripulación. Entra con la contraseña compartida.</p>
    <form novalidate @submit.prevent="submit">
      <div class="field">
        <label for="login-password" class="label">Contraseña</label>
        <div class="password">
          <input
            id="login-password"
            ref="input"
            v-model="password"
            class="input password__input"
            :type="visible ? 'text' : 'password'"
            name="password"
            autocomplete="current-password"
            autocapitalize="off"
            spellcheck="false"
            :aria-invalid="error ? 'true' : undefined"
            aria-describedby="login-error"
          />
          <button
            type="button"
            class="password__toggle"
            :aria-label="visible ? 'Ocultar contraseña' : 'Mostrar contraseña'"
            :aria-pressed="visible"
            @click="visible = !visible"
          >
            <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
              <path
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z"
              />
              <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="2" />
              <path
                v-if="visible"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                d="M4 4l16 16"
              />
            </svg>
          </button>
        </div>
      </div>
      <p id="login-error" class="field-error login__error" role="alert">{{ error }}</p>
      <button type="submit" class="btn btn--primary login__submit" :disabled="sending">
        {{ sending ? 'Entrando…' : 'Entrar' }}
      </button>
    </form>
  </section>
</template>

<style scoped>
.login {
  max-width: 26rem;
  margin: 2rem auto;
  text-align: center;
}
.login form {
  text-align: left;
}
.login__logo {
  width: 3rem;
  height: 3rem;
  margin: 0 auto 0.5rem;
}
.login__text {
  margin: 0 0 1.25rem;
}
.password {
  position: relative;
}
.password__input {
  padding-right: 3.25rem;
}
.password__toggle {
  position: absolute;
  top: 50%;
  right: 0.125rem;
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: 0;
  border-radius: 8px;
  transform: translateY(-50%);
}
.password__toggle[aria-pressed='true'] {
  color: var(--ink);
}
.password__toggle:focus-visible {
  outline: 3px solid var(--ink);
}
.login__error {
  min-height: 1.25rem;
  margin-top: 0.375rem;
}
.login__submit {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
