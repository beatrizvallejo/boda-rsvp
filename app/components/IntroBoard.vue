<script setup lang="ts">
/**
 * Primera vista: panel de LLEGADAS de terminal internacional con el vuelo KR 3107 Madrid → Alba.
 * Arriba, los nombres y la cuenta atrás; abajo, el aviso de megafonía.
 * Bajo el panel, el seguimiento del vuelo: el avión avanza según el tiempo que falta.
 * Se cierra con "Embarcar": las fichas se apagan en cascada desde el botón y el panel sube. Sin
 * JavaScript se retira sola a los 6 s para no bloquear la página.
 */
import { JOURNEY_START, WEDDING_START } from '#shared/config'

const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

const root = ref<HTMLElement | null>(null)
const button = ref<HTMLButtonElement | null>(null)
const isJs = ref(false)
const phase = ref<'idle' | 'flipping' | 'lifting'>('idle')

// ── Cuenta atrás (el valor inicial viene del servidor para no desajustar la hidratación) ──
const now = useState('intro-now', () => Date.now())
const remaining = computed(() => {
  const ms = Math.max(0, Date.parse(WEDDING_START) - now.value)
  const minutes = Math.floor(ms / 60_000)
  return {
    d: Math.floor(minutes / 1440),
    h: Math.floor((minutes % 1440) / 60),
    m: minutes % 60,
  }
})
const two = (n: number) => String(n).padStart(2, '0')

// ── Seguimiento del vuelo: % del trayecto entre JOURNEY_START y la boda ──
const progress = computed(() => {
  const from = Date.parse(JOURNEY_START)
  const to = Date.parse(WEDDING_START)
  return Math.min(1, Math.max(0, (now.value - from) / (to - from)))
})
const trackerShown = ref(0)

// ── Relojes de terminal (solo en cliente) ──
const clocks = ref({ madrid: '', alba: '' })
const clockFmt = (timeZone: string) =>
  new Intl.DateTimeFormat('es-ES', { timeZone, hour: '2-digit', minute: '2-digit' })
const madridFmt = clockFmt('Europe/Madrid')
const albaFmt = clockFmt('Europe/Bucharest')

// ── Panel: el vuelo Madrid → Alba; el estado alterna ES → RO → EN ──
type Lang = 'es' | 'ro' | 'en'
const LANGS: Lang[] = ['es', 'ro', 'en']
const lang = ref<Lang>('es')
const STATUS = {
  onTime: { es: 'EN HORA', ro: 'LA TIMP', en: 'ON TIME' },
  boarding: { es: 'EMBARCANDO', ro: 'ÎMBARCARE', en: 'BOARDING' },
} as const
/** Estado del vuelo KR3107 MADRID → ALBA en el panel (ámbar, parpadea). */
const FLIGHT_STATUS: keyof typeof STATUS = 'boarding'
const FLAP_DELAY = 1100

let clockTimer: ReturnType<typeof setInterval> | undefined
let langTimer: ReturnType<typeof setInterval> | undefined

const FLIP_MS = 1000

function board() {
  if (phase.value !== 'idle') return
  clearInterval(langTimer)
  // Cada ficha se apaga con un retardo según su distancia al botón: la cascada sale de ahí.
  const el = root.value
  const b = button.value?.getBoundingClientRect()
  if (el && b) {
    const cx = b.left + b.width / 2
    const cy = b.top + b.height / 2
    const far = Math.hypot(Math.max(cx, el.clientWidth - cx), Math.max(cy, el.clientHeight - cy))
    el.querySelectorAll<HTMLElement>('.flapt__tile').forEach((tile) => {
      const r = tile.getBoundingClientRect()
      const dist = Math.hypot(r.left + r.width / 2 - cx, r.top + r.height / 2 - cy)
      tile.style.setProperty('--out-delay', `${Math.round((dist / far) * (FLIP_MS - 300))}ms`)
    })
  }
  phase.value = 'flipping'
  setTimeout(() => (phase.value = 'lifting'), FLIP_MS)
  setTimeout(() => emit('close'), FLIP_MS + 550)
}

onMounted(() => {
  isJs.value = true
  const tick = () => {
    now.value = Date.now()
    clocks.value = { madrid: madridFmt.format(now.value), alba: albaFmt.format(now.value) }
  }
  tick()
  clockTimer = setInterval(tick, 10_000)
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    langTimer = setInterval(() => {
      lang.value = LANGS[(LANGS.indexOf(lang.value) + 1) % LANGS.length]!
    }, 5000)
  }
  setTimeout(() => button.value?.focus({ preventScroll: true }), 1800)
  // El avión del seguimiento sale de Madrid y se desliza hasta su posición.
  setTimeout(() => (trackerShown.value = progress.value), 1300)
})
onBeforeUnmount(() => {
  clearInterval(clockTimer)
  clearInterval(langTimer)
})
</script>

<template>
  <div
    ref="root"
    class="intro"
    :class="[`is-${phase}`, { 'is-js': isJs }]"
    role="dialog"
    aria-modal="true"
    aria-labelledby="intro-title"
  >
    <header class="intro__top">
      <p class="intro__kind">
        <PlaneIcon :rotate="135" />
        <span>{{ t('intro.arrivals') }}</span
        ><span class="intro__kind-alt">{{ t('intro.arrivalsAlt') }}</span>
      </p>
      <div class="intro__clocks" aria-hidden="true">
        <p>
          <span>Madrid</span><time>{{ clocks.madrid || '—:—' }}</time>
        </p>
        <p>
          <span>Alba</span><time>{{ clocks.alba || '—:—' }}</time>
        </p>
      </div>
    </header>

    <div class="intro__hero">
      <h2 id="intro-title" class="sr-only">
        {{ t('intro.srTitle', { d: remaining.d, h: remaining.h, m: remaining.m }) }}
      </h2>
      <div class="intro__title">
        <BrickCouple class="intro__couple" />
        <FlapText
          class="intro__names"
          :style="{ '--tiles': t('intro.names').length }"
          :text="t('intro.names')"
          :delay="200"
          :spins="[10, 18]"
        />
      </div>
      <div class="intro__count" aria-hidden="true">
        <span class="intro__count-label">{{ t('intro.countdown') }}</span>
        <span class="intro__unit"
          ><FlapText :text="String(remaining.d)" :length="3" :delay="700" :spins="[12, 20]" /><small
            >D</small
          ></span
        >
        <span class="intro__unit"
          ><FlapText :text="two(remaining.h)" :delay="800" :spins="[12, 20]" /><small
            >H</small
          ></span
        >
        <span class="intro__unit"
          ><FlapText :text="two(remaining.m)" :delay="900" :spins="[12, 20]" /><small
            >M</small
          ></span
        >
      </div>
      <p class="intro__date">{{ t('intro.date') }}</p>
    </div>

    <table class="arrivals" aria-hidden="true">
      <thead>
        <tr>
          <th class="col-flight">Vuelo <span>Zbor · Flight</span></th>
          <th>Origen <span>Origine · From</span></th>
          <th class="col-dest">Destino <span>Destinație · To</span></th>
          <th class="col-status">Estado <span>Status</span></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="col-flight">
            <FlapText text="KR3107" :delay="FLAP_DELAY" />
          </td>
          <td><FlapText text="MADRID" :length="6" :delay="FLAP_DELAY" /></td>
          <td class="col-dest"><FlapText text="ALBA" :delay="FLAP_DELAY" /></td>
          <td class="col-status" :class="`is-${FLIGHT_STATUS}`">
            <FlapText :text="STATUS[FLIGHT_STATUS][lang]" :length="10" :delay="FLAP_DELAY" />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="tracker" aria-hidden="true">
      <span>Madrid</span>
      <div class="tracker__line">
        <div class="tracker__done" :style="{ width: `${trackerShown * 100}%` }" />
        <PlaneIcon class="tracker__plane" :style="{ left: `${trackerShown * 100}%` }" />
      </div>
      <span>Alba</span>
    </div>
    <p class="tracker__label" aria-hidden="true">
      {{ t('intro.tracker', { pct: Math.round(progress * 100) }) }}
    </p>

    <div class="intro__action">
      <button ref="button" type="button" class="intro__go" @click="board">
        {{ t('intro.board') }} <span aria-hidden="true">→</span>
      </button>
    </div>

    <div class="pa" aria-hidden="true">
      <svg class="pa__icon" viewBox="0 0 24 24" width="24" height="24">
        <path
          fill="currentColor"
          d="M3 10v4h4l5 5V5L7 10zm13.5 2A4.5 4.5 0 0 0 14 8v8a4.5 4.5 0 0 0 2.5-4M14 3.2v2.1a7 7 0 0 1 0 13.4v2.1a9 9 0 0 0 0-17.6"
        />
      </svg>
      <div class="pa__track">
        <p class="pa__text">
          <span>Último aviso para los pasajeros del vuelo KR 3107</span>
          <span>Ultim apel pentru pasagerii zborului KR 3107</span>
          <span>Último aviso para los pasajeros del vuelo KR 3107</span>
          <span>Ultim apel pentru pasagerii zborului KR 3107</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.intro {
  /* Variables locales sobre los tokens globales (tokens.css) */
  --bg: var(--board);
  --ink: var(--board-ink);
  --muted: var(--board-muted);
  --line: var(--board-line);
  --glow: var(--board-glow);
  --pa-bg: var(--board-pa);
  --dash: var(--board-dash);
  --tile-ink: var(--board-ink);
  --green: var(--status-on-time);
  --amber: var(--status-boarding);
  --button: var(--signal);
  position: fixed;
  inset: 0;
  z-index: var(--z-intro);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: var(--ink);
  background: radial-gradient(120% 60% at 50% 0%, var(--glow) 0%, transparent 70%), var(--bg);
  container-type: inline-size;
}
.intro:not(.is-js) {
  animation: intro-fallback 0.6s ease-in 6s forwards;
}
@keyframes intro-fallback {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
.intro.is-lifting {
  transform: translateY(-100%);
  transition: transform 0.55s cubic-bezier(0.7, 0, 0.3, 1);
}

/* Fondo: negro con luz cenital de terminal y viñeta en los bordes (capa detrás del contenido) */
.intro::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: var(--board-light);
}
.intro__names,
.intro__unit,
.arrivals td {
  color: var(--tile-ink);
}

/* Las fichas se apagan en cascada desde el botón */
.is-flipping :deep(.flapt__tile),
.is-lifting :deep(.flapt__tile) {
  animation: tile-out 0.3s cubic-bezier(0.5, 0, 0.75, 0) var(--out-delay, 0ms) forwards;
}
@keyframes tile-out {
  to {
    transform: rotateX(-90deg);
    opacity: 0;
  }
}
.is-flipping .intro__go,
.is-flipping .intro__date,
.is-flipping .tracker,
.is-flipping .tracker__label,
.is-flipping .pa {
  opacity: 0;
  transition: opacity 0.25s;
}

/* ── Barra superior: tipo de panel y relojes ── */
.intro__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding: max(0.875rem, env(safe-area-inset-top)) 1.5rem 0.875rem;
  border-bottom: 1px solid var(--line);
}
.intro__kind {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.intro__kind svg {
  width: 1.5rem;
  height: 1.5rem;
}
.intro__kind-alt {
  font-weight: 400;
  color: var(--muted);
}
@media (max-width: 479px) {
  .intro__kind-alt {
    display: none;
  }
}
.intro__clocks {
  display: flex;
  gap: 1rem;
}
.intro__clocks p {
  display: grid;
  margin: 0;
  text-align: right;
}
.intro__clocks span {
  font-size: 0.6875rem;
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.intro__clocks time {
  font-size: 1.125rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ── Nombres y cuenta atrás ── */
.intro__hero {
  margin-top: auto;
  display: grid;
  justify-items: center;
  gap: clamp(1.25rem, 3cqi, 2rem);
  padding: 1.5rem 1.5rem clamp(2rem, 5cqi, 3rem);
  text-align: center;
}
.intro__names {
  /* Que quepan todas las fichas en el ancho: cada una mide 0.92em + 0.1em de separación. «KEKO ȘI RO»
     (rumano) tiene una ficha más que «KEKO Y RO». */
  font-size: min(4.5rem, calc((100cqi - 3rem) / (var(--tiles, 9) * 1.02 + 0.2)));
}
.intro__count {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 0.75rem 1rem;
  font-size: min(1.75rem, 6.5cqi);
}
.intro__count-label {
  flex-basis: 100%;
  font-size: 0.75rem;
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}
.intro__unit {
  display: inline-flex;
  gap: 0.25rem;
  align-items: flex-end;
}
.intro__unit small {
  font-size: 0.5em;
  font-weight: 800;
  color: var(--muted);
}
.intro__date {
  margin: 0;
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--muted);
}

/* ── Panel de llegadas ── */
.arrivals {
  flex: none;
  width: min(100% - 3rem, 60rem);
  margin: 0 auto;
  border-collapse: collapse;
  /* Móvil: origen (6 fichas) + estado (10); escritorio: 6 + 6 + 4 + 10 */
  font-size: min(1.5rem, calc((100cqi - 3.5rem) / 18));
}
@media (min-width: 720px) {
  .arrivals {
    font-size: min(2rem, calc((min(100cqi, 60rem) - 4rem) / 28));
  }
}
.arrivals th {
  padding: 0 0.75em 0.75rem 0;
  text-align: left;
  font-size: 0.75rem;
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  border-bottom: 1px solid var(--line);
}
.arrivals th span {
  font-weight: 400;
  color: var(--muted);
}
@media (max-width: 479px) {
  .arrivals th span {
    display: none;
  }
}
.arrivals td {
  padding: 0.5em 0.75em 0.5em 0;
  border-bottom: 1px solid var(--line);
}
.arrivals td:last-child,
.arrivals th:last-child {
  padding-right: 0;
}
.arrivals .is-onTime {
  color: var(--green);
}
.arrivals .is-boarding {
  color: var(--amber);
}
.arrivals .is-boarding :deep(.flapt) {
  animation: blink 1.6s steps(2, jump-none) infinite;
}
@keyframes blink {
  50% {
    opacity: 0.55;
  }
}
.col-flight,
.col-dest {
  display: none;
}
@media (min-width: 720px) {
  .col-flight,
  .col-dest {
    display: table-cell;
  }
}

/* ── Seguimiento del vuelo ── */
.tracker {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  width: min(100% - 3rem, 60rem);
  margin: 1.75rem auto 0;
  font-size: 0.8125rem;
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--muted);
}
.tracker__line {
  position: relative;
  flex: 1;
  height: 2px;
  background: repeating-linear-gradient(90deg, var(--dash) 0 6px, transparent 6px 12px);
}
.tracker__done {
  position: absolute;
  inset: 0 auto 0 0;
  background: var(--ink);
  transition: width 1.8s cubic-bezier(0.3, 0.7, 0.2, 1);
}
.tracker__plane {
  position: absolute;
  top: 50%;
  width: 28px;
  height: 28px;
  color: var(--ink);
  transform: translate(-50%, -50%);
  filter: drop-shadow(0 0 6px rgb(255 255 255 / 0.35));
  transition: left 1.8s cubic-bezier(0.3, 0.7, 0.2, 1);
}
.tracker__label {
  width: min(100% - 3rem, 60rem);
  margin: 0.625rem auto 0;
  text-align: center;
  font-size: 0.8125rem;
  color: var(--muted);
}

/* ── Móvil: los 9 espacios entre bloques se reparten a partes iguales la altura libre (`100dvh` menos
   los ~31rem de contenido fijo), cada uno con su valor del diseño original como tope. Así, en
   pantallas bajas todo cabe sin scroll, megafonía incluida, y en las altas queda como siempre. El
   scroll queda solo como último recurso. ── */
@media (max-width: 719px) {
  .intro {
    --gap: clamp(0.125rem, (100dvh - 31rem) / 9, 2.5rem);
    overflow-y: auto;
  }
  .intro__top {
    padding-block: max(min(var(--gap), 0.875rem), env(safe-area-inset-top))
      min(var(--gap), 0.875rem);
  }
  .intro__hero {
    gap: min(var(--gap), 1.75rem);
    padding: var(--gap) 1.5rem;
  }
  .intro__title {
    gap: min(var(--gap), 1rem);
  }
  .intro__count {
    row-gap: min(var(--gap), 0.875rem);
  }
  .arrivals td {
    padding-block: min(var(--gap) / 2, 0.7em);
  }
  .tracker {
    margin-top: min(var(--gap), 2.25rem);
  }
  .tracker__label {
    margin-top: min(var(--gap), 0.875rem);
  }
  .intro__action {
    padding: var(--gap) 1rem min(var(--gap), 2rem);
  }
}

/* ── Botón: el único elemento amarillo ── */
.intro__action {
  margin-bottom: auto;
  display: grid;
  place-items: center;
  padding: clamp(1.5rem, 4cqi, 2.75rem) 1rem 1.5rem;
}
/* Los novios: encima del nombre en móvil; en escritorio, a la izquierda de la K con algo de aire y
   en posición absoluta (no empujan nada) */
.intro__title {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.intro__couple {
  /* Móvil: encoge en pantallas bajas; en escritorio ocupa el alto del nombre (abajo) */
  height: clamp(52px, 10dvh, 76px);
}
@media (min-width: 720px) {
  .intro__couple {
    position: absolute;
    right: calc(100% + 2.5rem);
    bottom: 0;
    height: 100%;
  }
}
.is-flipping .intro__couple {
  opacity: 0;
  transform: translateY(-12px);
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.intro__go {
  display: inline-flex;
  gap: 0.75rem;
  align-items: center;
  min-height: 60px;
  padding: 0 2.5rem;
  font: inherit;
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--on-signal);
  background: var(--button);
  border: 0;
  border-radius: var(--radius-pill);
  cursor: pointer;
  animation:
    go-in 0.5s ease-out 1.8s both,
    go-pulse 2.4s ease-out 2.6s infinite;
}
@keyframes go-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
}
@keyframes go-pulse {
  0% {
    box-shadow: 0 0 0 0 rgb(255 198 41 / 0.55);
  }
  70% {
    box-shadow: 0 0 0 18px rgb(255 198 41 / 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgb(255 198 41 / 0);
  }
}
.intro__go:focus-visible {
  outline: 3px solid var(--ink);
  outline-offset: 4px;
}

/* ── Megafonía ── */
.pa {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 1.5rem max(0.625rem, env(safe-area-inset-bottom));
  font-size: 0.875rem;
  color: var(--ink);
  background: var(--pa-bg);
  border-top: 1px solid var(--line);
}
.pa__icon {
  flex: none;
  width: 1.25rem;
  height: 1.25rem;
  color: var(--muted);
}
.pa__track {
  min-width: 0;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent, #000 2rem, #000 calc(100% - 2rem), transparent);
}
.pa__text {
  display: flex;
  width: max-content;
  margin: 0;
  white-space: nowrap;
  animation: pa-scroll 60s linear infinite;
}
.pa__text span {
  padding-right: 3rem;
}
@keyframes pa-scroll {
  to {
    transform: translateX(-50%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .intro__go,
  .pa__text,
  .arrivals .is-boarding :deep(.flapt) {
    animation: none;
  }
}
</style>
