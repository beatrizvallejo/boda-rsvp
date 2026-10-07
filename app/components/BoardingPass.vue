<script setup lang="ts">
/**
 * La tarjeta de embarque: el formulario de confirmación. Vertical en móvil; apaisada con el talón a la
 * derecha en escritorio. Precarga el nombre (y la respuesta previa, si la hay).
 * Valida con el mismo esquema Zod que el servidor y emite `confirm` con los datos ya válidos; el envío
 * lo hace la página. Con `readonly` (plazo cerrado) solo muestra la respuesta guardada.
 */
import { rsvpInputSchema, type JointFlight, type PublicRsvp, type RsvpData } from '#shared/schemas'

type Field = 'guestName' | 'companionName' | 'email'
export interface FieldIssue {
  path: string[]
  code: string
}

const props = defineProps<{
  guestName: string
  rsvp?: PublicRsvp | null
  readonly?: boolean
  pending?: boolean
  /** Error general del envío (red, servidor), ya traducido. */
  submitError?: string | null
  /** Pregunta por la reserva conjunta de vuelos (solo con la reserva en marcha). */
  askJointFlight?: boolean
}>()
const emit = defineEmits<{ confirm: [data: RsvpData] }>()
const { t } = useI18n()

const name = ref(props.rsvp?.guestName ?? props.guestName)
const withCompanion = ref(Boolean(props.rsvp?.companionName))
const companionName = ref(props.rsvp?.companionName ?? '')
const children = ref(props.rsvp?.children ?? 0)
const email = ref(props.rsvp?.email ?? '')
// Lo opcional va plegado (email y, con la reserva de vuelos en marcha, la pregunta del vuelo
// conjunto): solo se despliega si el invitado quiere (o si ya lo había contestado).
const showMore = ref(Boolean(props.rsvp?.email || props.rsvp?.jointFlight))
// Opcional: sin respuesta (`null`) hasta que el invitado elige. Si no se pregunta, se conserva la guardada.
const jointFlight = ref<JointFlight | null>(props.rsvp?.jointFlight ?? null)
const JOINT_FLIGHT_OPTIONS = [
  { value: 'yes', label: 'pass.jointFlightYes' },
  { value: 'no', label: 'pass.jointFlightNo' },
] as const

const passengers = computed(() => 1 + (withCompanion.value ? 1 : 0) + children.value)

const input = computed(() => ({
  guestName: name.value,
  companionName: withCompanion.value ? companionName.value : null,
  children: children.value,
  email: showMore.value ? email.value : null,
  jointFlight: jointFlight.value,
}))

// Con respuesta previa, "Guardar cambios" solo se activa si algo cambia respecto a lo guardado.
const dirty = computed(() => {
  if (!props.rsvp) return true
  const parsed = rsvpInputSchema.safeParse(input.value)
  if (!parsed.success) return true
  const { guestName, companionName, children, email, jointFlight } = props.rsvp
  return (
    JSON.stringify(parsed.data) !==
    JSON.stringify({ guestName, companionName, children, email, jointFlight })
  )
})

const errors = ref<Partial<Record<Field, string>>>({})
const touched = ref(false)

function messageFor(issue: FieldIssue): [Field, string] | null {
  const field = issue.path[0]
  if (field === 'guestName')
    return [field, t(issue.code === 'too_big' ? 'errors.nameTooLong' : 'errors.guestName')]
  if (field === 'companionName')
    return [field, t(issue.code === 'too_big' ? 'errors.nameTooLong' : 'errors.companionName')]
  if (field === 'email') return [field, t('errors.email')]
  return null
}

const formEl = ref<HTMLFormElement>()

/** Pinta los errores por campo (del cliente o del 422 del servidor) y lleva al primero. */
async function showIssues(issues: FieldIssue[]) {
  const next: Partial<Record<Field, string>> = {}
  for (const issue of issues) {
    const entry = messageFor(issue)
    if (entry && !next[entry[0]]) next[entry[0]] = entry[1]
  }
  errors.value = next
  await nextTick()
  const first = formEl.value?.querySelector<HTMLElement>('[aria-invalid="true"]')
  first?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  first?.focus({ preventScroll: true })
}

function validate() {
  const result = rsvpInputSchema.safeParse(input.value)
  if (result.success) {
    errors.value = {}
    return result.data
  }
  showIssues(result.error.issues.map((i) => ({ path: i.path.map(String), code: i.code })))
  return null
}

// Tras el primer intento, los errores se corrigen según se escribe.
watch(input, () => {
  if (touched.value && Object.keys(errors.value).length) validate()
})

function confirm() {
  if (props.readonly || props.pending) return
  touched.value = true
  const data = validate()
  if (data) emit('confirm', data)
}

defineExpose({ showIssues })
</script>

<template>
  <form ref="formEl" class="pass" novalidate @submit.prevent="confirm">
    <header class="pass__band">
      <span class="pass__airline"><AirlineLogo class="pass__mono" /> {{ t('brand') }}</span>
      <span class="pass__doc">{{ t('pass.band') }}</span>
    </header>

    <div class="pass__main">
      <div class="pass__route">
        <div>
          <span class="label">{{ t('pass.from') }}</span>
          <span class="pass__city">{{ t('pass.fromValue') }}</span>
        </div>
        <svg
          class="pass__path"
          viewBox="0 0 120 24"
          width="120"
          height="24"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          <line
            x1="2"
            y1="12"
            x2="118"
            y2="12"
            stroke="currentColor"
            stroke-width="2"
            stroke-dasharray="4 5"
          />
        </svg>
        <PlaneIcon class="pass__plane" />
        <div class="pass__to">
          <span class="label">{{ t('pass.to') }}</span>
          <span class="pass__city">{{ t('pass.toValue') }}</span>
        </div>
      </div>

      <dl class="pass__info">
        <div>
          <dt class="label">{{ t('pass.flight') }}</dt>
          <dd>KR 3107</dd>
        </div>
        <div>
          <dt class="label">{{ t('pass.date') }}</dt>
          <dd>{{ t('pass.dateValue') }}</dd>
        </div>
        <div>
          <dt class="label">{{ t('pass.boarding') }}</dt>
          <dd>13:00</dd>
        </div>
        <div>
          <dt class="label">{{ t('pass.gate') }}</dt>
          <dd>Roots</dd>
        </div>
        <div>
          <dt class="label">{{ t('pass.seat') }}</dt>
          <dd>{{ t('pass.seatValue') }}</dd>
        </div>
        <div>
          <dt class="label">{{ t('pass.class') }}</dt>
          <dd>{{ t('pass.classValue') }}</dd>
        </div>
      </dl>

      <fieldset class="pass__fields" :disabled="readonly">
        <legend class="sr-only">{{ t('pass.title') }}</legend>
        <label class="field">
          <span class="label">{{ t('pass.passenger') }}</span>
          <input
            v-model="name"
            class="field__input"
            autocomplete="name"
            maxlength="80"
            :aria-invalid="Boolean(errors.guestName)"
            :aria-describedby="errors.guestName ? 'err-guestName' : undefined"
          />
          <span v-if="errors.guestName" id="err-guestName" class="field__error">{{
            errors.guestName
          }}</span>
        </label>
        <div class="field">
          <span id="companion-label" class="label">{{ t('pass.companionQuestion') }}</span>
          <div class="segmented" role="radiogroup" aria-labelledby="companion-label">
            <button
              type="button"
              role="radio"
              :aria-checked="!withCompanion"
              @click="withCompanion = false"
            >
              {{ t('pass.alone') }}
            </button>
            <button
              type="button"
              role="radio"
              :aria-checked="withCompanion"
              @click="withCompanion = true"
            >
              {{ t('pass.withCompanion') }}
            </button>
          </div>
        </div>
        <label v-if="withCompanion" class="field">
          <span class="label">{{ t('pass.companion') }}</span>
          <input
            v-model="companionName"
            class="field__input"
            :placeholder="t('pass.namePlaceholder')"
            autocomplete="off"
            maxlength="80"
            :aria-invalid="Boolean(errors.companionName)"
            :aria-describedby="errors.companionName ? 'err-companionName' : undefined"
          />
          <span v-if="errors.companionName" id="err-companionName" class="field__error">{{
            errors.companionName
          }}</span>
        </label>
        <div class="field">
          <span id="kids-label" class="label">{{ t('pass.kids') }}</span>
          <div class="stepper" role="group" aria-labelledby="kids-label">
            <button
              type="button"
              :aria-label="t('pass.kidsLess')"
              @click="children = Math.max(0, children - 1)"
            >
              −
            </button>
            <output aria-live="polite">{{ children }}</output>
            <button
              type="button"
              :aria-label="t('pass.kidsMore')"
              @click="children = Math.min(10, children + 1)"
            >
              +
            </button>
          </div>
        </div>
      </fieldset>

      <div v-if="!readonly || showMore" class="pass__email">
        <button
          v-if="!showMore"
          type="button"
          class="pass__email-toggle"
          :aria-expanded="showMore"
          @click="showMore = true"
        >
          + {{ askJointFlight ? t('pass.moreOptions') : t('pass.addEmail') }}
        </button>
        <template v-else>
          <label class="field">
            <span class="label">{{ t('pass.email') }}</span>
            <input
              v-model="email"
              class="field__input"
              type="email"
              inputmode="email"
              autocomplete="email"
              maxlength="254"
              :disabled="readonly"
              :aria-invalid="Boolean(errors.email)"
              :aria-describedby="errors.email ? 'err-email' : 'email-help'"
            />
            <span v-if="errors.email" id="err-email" class="field__error">{{ errors.email }}</span>
            <span id="email-help" class="field__help">{{ t('pass.emailHelp') }}</span>
          </label>
          <div v-if="askJointFlight" class="field">
            <span id="flight-label" class="label">{{ t('pass.jointFlight') }}</span>
            <div
              class="segmented"
              role="radiogroup"
              aria-labelledby="flight-label"
              aria-describedby="flight-help"
            >
              <button
                v-for="option in JOINT_FLIGHT_OPTIONS"
                :key="option.value"
                type="button"
                role="radio"
                :disabled="readonly"
                :aria-checked="jointFlight === option.value"
                @click="jointFlight = option.value"
              >
                {{ t(option.label) }}
              </button>
            </div>
            <span id="flight-help" class="field__help">{{ t('pass.jointFlightHelp') }}</span>
          </div>
        </template>
      </div>

      <p class="pass__micro" aria-hidden="true">
        KR3107·ALBA·31JUL27·KEKOYRO·KR3107·ALBA·31JUL27·KEKOYRO·KR3107·ALBA·31JUL27·KEKOYRO
      </p>
    </div>

    <div class="perf" aria-hidden="true" />

    <footer class="pass__stub">
      <div class="stub__brand" aria-hidden="true">
        <AirlineLogo class="stub__logo" />
        <span class="stub__name">{{ t('brand') }}</span>
        <span class="stub__tagline">{{ t('pass.airline') }}</span>
      </div>
      <div class="stub__meta">
        <span
          ><span class="label">{{ t('pass.flight') }}</span
          >KR 3107</span
        >
        <span
          ><span class="label">{{ t('pass.seat') }}</span
          >{{ t('pass.seatValue') }}</span
        >
        <span
          ><span class="label">{{ t('pass.passengers') }}</span
          >{{ passengers }}</span
        >
      </div>
      <div class="stub__code">
        <div class="stub__barcode" aria-hidden="true" />
        <span v-if="rsvp" class="stub__stamp">{{ t('success.stamp') }}</span>
      </div>
      <p v-if="rsvp && !readonly" class="stub__note">{{ t('pass.confirmedNote') }}</p>
      <p v-if="submitError" class="stub__error" role="alert">{{ submitError }}</p>
      <button
        v-if="!readonly"
        type="submit"
        class="pass__confirm"
        :disabled="pending || !dirty"
        :aria-busy="pending"
      >
        {{ pending ? t('pass.sending') : rsvp ? t('pass.save') : t('pass.confirm') }}
      </button>
    </footer>
  </form>
</template>

<style scoped>
.pass {
  max-width: 360px;
  margin: 0 auto;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
  overflow: hidden;
}
.pass__band {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1.25rem;
  color: var(--on-signal);
  background: var(--signal);
}
.pass__airline {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-weight: 800;
  white-space: nowrap;
}
.pass__mono {
  width: 1.875rem;
  height: 1.875rem;
}
.pass__doc {
  text-align: right;
  font-size: 0.8125rem;
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  white-space: nowrap;
}
.pass__main {
  padding: 1.25rem 1.25rem 0.75rem;
}
.pass__route {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 0.5rem;
  align-items: end;
}
.pass__city {
  font-size: 1.125rem;
  font-weight: 700;
}
.pass__path {
  width: 100%;
  height: 24px;
  color: var(--pass-path);
}
.pass__plane {
  width: 22px;
  height: 22px;
  margin-bottom: 1px;
}
.pass__to {
  text-align: right;
}
.pass__info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem 0.5rem;
  margin: 1rem 0;
  padding: 0.875rem 0;
  border-block: 1px solid var(--line);
}
.pass__info dd {
  margin: 0.125rem 0 0;
  font-size: 0.9375rem;
  font-weight: 600;
  white-space: nowrap;
}
.pass__fields {
  display: grid;
  gap: 1rem;
}
.pass__email {
  margin-top: 1rem;
}
.pass__email .field + .field {
  margin-top: 1rem;
}
.pass__email-toggle {
  min-height: 44px;
  padding: 0;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--muted);
  text-decoration: underline;
  text-underline-offset: 3px;
  background: none;
  border: 0;
  cursor: pointer;
}
.pass__email-toggle:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 2px;
}
.field {
  display: grid;
  gap: 0.375rem;
}
.pass__fields {
  min-width: 0;
  margin: 0;
  padding: 0;
  border: 0;
}
.field__error {
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--error);
}
.field__input[aria-invalid='true'] {
  border-color: var(--error);
  box-shadow: 0 0 0 1px var(--error);
}
.field__input:disabled {
  color: var(--ink);
  -webkit-text-fill-color: var(--ink);
  background: var(--paper-disabled);
  border-color: var(--line);
  opacity: 1;
}
.pass__fields:disabled .segmented,
.pass__fields:disabled .stepper button {
  opacity: 0.6;
}
.pass__fields:disabled button {
  cursor: default;
}
.field__help {
  font-size: 0.8125rem;
  color: var(--muted);
}
.field__input {
  width: 100%;
  min-height: 48px;
  padding: 0 0.875rem;
  font-size: var(--fs-input);
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-control);
}
.field__input::placeholder {
  color: var(--muted);
}
.field__input:focus-visible,
.stepper button:focus-visible,
.segmented button:focus-visible,
.pass__confirm:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 2px;
}
.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  padding: 4px;
  background: var(--paper-sunken);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-button);
}
.segmented button {
  min-height: 44px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--ink);
  background: none;
  border: 0;
  border-radius: var(--radius-inner);
  cursor: pointer;
}
.segmented button[aria-checked='true'] {
  color: var(--signal);
  background: var(--ink);
}
.stepper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.stepper button {
  width: 48px;
  height: 48px;
  font-size: 1.25rem;
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-control);
  cursor: pointer;
}
.stepper output {
  min-width: 2ch;
  text-align: center;
  font-size: 1.25rem;
}
.pass__micro {
  margin: 1.25rem 0 0;
  overflow: hidden;
  font-size: 0.5625rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  white-space: nowrap;
  color: var(--pass-micro);
}

/* Perforación con muescas que dejan ver el fondo */
.perf {
  position: relative;
  height: 28px;
  background: radial-gradient(circle, var(--perforation) 1.5px, transparent 2px) repeat-x 0 50% /
    10px 4px;
}
.perf::before,
.perf::after {
  content: '';
  position: absolute;
  top: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--page);
  box-shadow: inset 0 2px 3px rgb(0 0 0 / 0.12);
}
.perf::before {
  left: -14px;
}
.perf::after {
  right: -14px;
}

.pass__stub {
  display: grid;
  gap: 1rem;
  padding: 0.75rem 1.25rem 1.5rem;
}
.stub__brand {
  display: none;
}
.stub__logo {
  width: 88px;
  height: 88px;
  margin-bottom: 0.5rem;
  filter: drop-shadow(0 6px 10px rgb(0 0 0 / 0.18));
  transform: rotate(-6deg);
  /* Cada 6 s gira en horizontal (sobre su eje vertical), como una moneda */
  animation: logo-spin 6s cubic-bezier(0.45, 0, 0.25, 1) 2s infinite;
}
@keyframes logo-spin {
  0%,
  78% {
    transform: perspective(400px) rotate(-6deg) rotateY(0deg);
  }
  96%,
  100% {
    transform: perspective(400px) rotate(-6deg) rotateY(360deg);
  }
}
.stub__name {
  font-size: 1.25rem;
  font-weight: 800;
  font-stretch: var(--stretch-display);
}
.stub__tagline {
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}
.stub__meta {
  display: flex;
  justify-content: space-between;
  font-weight: 700;
}
.stub__barcode {
  height: 44px;
  background: repeating-linear-gradient(
    90deg,
    var(--ink) 0 2px,
    transparent 2px 4px,
    var(--ink) 4px 5px,
    transparent 5px 8px,
    var(--ink) 8px 11px,
    transparent 11px 13px
  );
  opacity: 0.9;
}
.stub__code {
  position: relative;
}
.stub__stamp {
  position: absolute;
  top: 50%;
  right: 0.5rem;
  padding: 0.125rem 0.625rem;
  font-size: 1.125rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--stamp);
  background: rgb(255 255 255 / 0.75);
  border: 3px double var(--stamp);
  border-radius: var(--radius-inner);
  transform: translateY(-50%) rotate(-8deg);
}
.stub__note {
  margin: 0;
  font-size: var(--fs-small);
  color: var(--muted);
}
.stub__error {
  margin: 0;
  padding: 0.625rem 0.75rem;
  font-size: var(--fs-small);
  font-weight: 600;
  color: var(--error);
  background: color-mix(in srgb, var(--error) 8%, var(--paper));
  border-radius: var(--radius-control);
}
.pass__confirm:disabled {
  color: var(--muted);
  background: var(--line);
  cursor: default;
}
.pass__confirm[aria-busy='true'] {
  opacity: 0.75;
}
.pass__confirm {
  width: 100%;
  min-height: 52px;
  font-weight: 700;
  font-size: var(--fs-input);
  color: var(--signal);
  background: var(--ink);
  border: 0;
  border-radius: var(--radius-button);
  cursor: pointer;
}

/* Tableta: más ancha, todavía vertical */
@media (min-width: 600px) {
  .pass {
    max-width: 34rem;
  }
}
/* Escritorio: apaisada con el talón a la derecha */
@media (min-width: 900px) {
  .pass {
    display: grid;
    grid-template-columns: 1fr 28px 300px;
    grid-template-rows: auto 1fr;
    max-width: 64rem;
  }
  .pass__band {
    grid-column: 1 / -1;
    padding-inline: 2rem;
  }
  .pass__main {
    padding: 1.75rem 2rem 1.25rem;
  }
  .pass__city {
    font-size: 1.5rem;
  }
  .pass__info {
    grid-template-columns: repeat(6, auto);
    justify-content: space-between;
  }
  .pass__fields {
    grid-template-columns: 1fr 1fr;
    gap: 1.25rem 1.5rem;
  }
  .pass__email {
    max-width: calc(50% - 0.75rem);
  }
  .perf {
    width: 28px;
    height: auto;
    background: radial-gradient(circle, var(--perforation) 1.5px, transparent 2px) repeat-y 50% 0 /
      4px 10px;
  }
  .perf::before {
    top: -14px;
    left: 0;
  }
  .perf::after {
    top: auto;
    bottom: -14px;
    right: 0;
  }
  .stub__brand {
    display: grid;
    justify-items: center;
    gap: 0.25rem;
    margin-bottom: auto;
    padding-top: 0.5rem;
    text-align: center;
  }
  .pass__stub {
    display: flex;
    flex-direction: column;
    padding: 1.75rem 1.75rem 2rem;
    background: color-mix(in srgb, var(--signal) 12%, var(--paper));
  }
}
</style>
