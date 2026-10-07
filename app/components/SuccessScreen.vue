<script setup lang="ts">
// Pantalla de éxito tras confirmar: amarilla a pantalla completa, novios saludando y la tarjeta con el
// sello CONFIRMADO que cae con un golpe, y los botones del calendario. Se cierra tocando cualquier parte
// fuera de los botones (o con Escape).
import { googleCalendarUrl } from '#shared/calendar'

defineProps<{
  passengers: string[]
  /** `true` si se han guardado cambios de una respuesta anterior. */
  edited?: boolean
}>()
const emit = defineEmits<{ close: [] }>()
const { t, locale } = useI18n()

function onKey(event: KeyboardEvent) {
  if (event.key === 'Escape') emit('close')
}
onMounted(() => {
  document.documentElement.style.overflow = 'hidden'
  window.addEventListener('keydown', onKey)
})
onBeforeUnmount(() => {
  document.documentElement.style.overflow = ''
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div
    class="success"
    role="dialog"
    aria-modal="true"
    aria-labelledby="success-title"
    @click="emit('close')"
  >
    <div class="success__inner">
      <p class="success__kicker" aria-hidden="true">
        KR 3107 · {{ t('pass.fromValue') }} → {{ t('pass.toValue') }}
      </p>
      <h2 id="success-title" class="success__title">
        {{ edited ? t('success.editedTitle') : t('success.title') }}
      </h2>
      <p class="success__lead">{{ t('success.lead') }}</p>

      <div class="success__stage">
        <BrickCouple class="success__couple" wave />
        <article class="issued">
          <header class="issued__band">
            <span class="issued__airline"
              ><AirlineLogo class="issued__mono" /> {{ t('brand') }}</span
            >
            <span>{{ t('pass.band') }}</span>
          </header>
          <div class="issued__body">
            <div class="issued__route">
              <div>
                <span class="label">{{ t('pass.from') }}</span
                ><b>{{ t('pass.fromValue') }}</b>
              </div>
              <PlaneIcon />
              <div class="issued__to">
                <span class="label">{{ t('pass.to') }}</span
                ><b>{{ t('pass.toValue') }}</b>
              </div>
            </div>
            <dl class="issued__info">
              <div class="issued__pax">
                <dt class="label">{{ t('pass.passengers') }}</dt>
                <dd>{{ passengers.join(' · ') }}</dd>
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
            </dl>
            <div class="issued__barcode" aria-hidden="true" />
          </div>
          <div class="stamp" aria-hidden="true">
            <span>{{ t('success.stamp') }}</span>
            <small>KR3107 · {{ t('pass.dateValue') }} · Alba</small>
          </div>
        </article>
      </div>

      <div class="calendar" @click.stop>
        <p class="calendar__title">{{ t('success.calendar') }}</p>
        <div class="calendar__buttons">
          <a class="calendar__btn" :href="googleCalendarUrl(locale)" target="_blank" rel="noopener">
            Google Calendar
          </a>
          <a class="calendar__btn" :href="`/boda.ics?lang=${locale}`">
            {{ t('success.calendarIcs') }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success {
  position: fixed;
  inset: 0;
  z-index: var(--z-overlay);
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  overflow: hidden auto;
  padding: 1.5rem 1.25rem max(1.5rem, env(safe-area-inset-bottom));
  color: var(--on-signal);
  background:
    radial-gradient(70% 50% at 50% 0%, rgb(255 255 255 / 0.35), transparent 70%), var(--signal);
  cursor: pointer;
  animation: success-in 0.55s cubic-bezier(0.6, 0, 0.2, 1);
}
@keyframes success-in {
  from {
    clip-path: circle(0 at 50% 90%);
  }
  to {
    clip-path: circle(150% at 50% 90%);
  }
}
.success__inner {
  display: grid;
  justify-items: center;
  gap: 0.5rem;
  width: min(100%, 46rem);
  text-align: center;
}
.success__kicker {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.success__title {
  margin: 0;
  font-size: clamp(1.625rem, 5vw, 2.5rem);
  font-weight: 800;
  line-height: 1.1;
}
.success__lead {
  margin: 0 0 1.25rem;
  font-size: var(--fs-lead);
}
.success__stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  margin-bottom: 0.5rem;
}
.success__couple {
  height: 88px;
  /* Pegatina: borde blanco para que destaquen sobre el amarillo */
  filter: drop-shadow(2.5px 0 0 var(--paper)) drop-shadow(-2.5px 0 0 var(--paper))
    drop-shadow(0 2.5px 0 var(--paper)) drop-shadow(0 -2.5px 0 var(--paper))
    drop-shadow(0 6px 8px rgb(0 0 0 / 0.25));
}
@media (min-width: 720px) {
  .success__couple {
    height: 132px;
  }
}
/* Escritorio: los novios, fuera del flujo a la izquierda de la tarjeta, para que esta quede centrada
   con el título y la botonera. Por debajo de 900px no caben al lado y van encima, como en móvil. */
@media (min-width: 900px) {
  .success__stage {
    position: relative;
  }
  .success__couple {
    position: absolute;
    right: calc(50% + 12.5rem + 2rem);
    bottom: 0;
  }
}

/* Tarjeta emitida */
.issued {
  position: relative;
  width: min(100%, 25rem);
  text-align: left;
  background: var(--paper);
  border-radius: var(--radius-pass-small);
  box-shadow:
    0 2px 4px rgb(0 0 0 / 0.1),
    0 30px 50px -24px rgb(0 0 0 / 0.45);
  animation: card-thud 0.35s ease-out 1.05s;
}
@keyframes card-thud {
  30% {
    transform: translateY(3px) rotate(-0.6deg);
  }
  60% {
    transform: translateY(-1px) rotate(0.3deg);
  }
}
.issued__band {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.25rem;
  font-size: 0.8125rem;
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--signal);
  background: var(--ink);
  border-radius: var(--radius-pass-small) var(--radius-pass-small) 0 0;
}
.issued__airline {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 1rem;
  font-stretch: var(--stretch-body);
  letter-spacing: 0;
  text-transform: none;
  color: var(--paper);
}
.issued__mono {
  width: 1.75rem;
  height: 1.75rem;
  box-shadow: 0 0 0 1.5px var(--paper);
  border-radius: 50%;
}
.issued__body {
  display: grid;
  gap: 1rem;
  padding: 1.25rem;
}
.issued__route {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: end;
}
.issued__route b {
  font-size: 1.125rem;
}
.issued__route svg {
  justify-self: center;
  width: 22px;
  height: 22px;
}
.issued__to {
  text-align: right;
}
.issued__info {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.75rem 0.5rem;
  margin: 0;
  padding-top: 0.875rem;
  border-top: 1px solid var(--line);
}
.issued__info dd {
  margin: 0.125rem 0 0;
  font-weight: 600;
  white-space: nowrap;
}
.issued__pax {
  grid-column: 1 / -1;
}
.issued__pax dd {
  white-space: normal;
}
.issued__barcode {
  height: 40px;
  background: repeating-linear-gradient(
    90deg,
    var(--ink) 0 2px,
    transparent 2px 4px,
    var(--ink) 4px 5px,
    transparent 5px 8px,
    var(--ink) 8px 11px,
    transparent 11px 13px
  );
}

/* Añadir al calendario: lo único pulsable de la pantalla */
.calendar {
  display: grid;
  justify-items: center;
  gap: 0.625rem;
  width: min(100%, 25rem);
  margin-top: 1.75rem;
  cursor: default;
}
.calendar__title {
  margin: 0;
  font-size: var(--fs-small);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.calendar__buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.625rem;
  width: 100%;
}
.calendar__btn {
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.5rem;
  font-size: 0.9375rem;
  font-weight: 700;
  line-height: 1.15;
  color: var(--signal);
  text-decoration: none;
  background: var(--ink);
  border-radius: var(--radius-button);
}
.calendar__btn:focus-visible {
  outline: 3px solid var(--paper);
  outline-offset: 2px;
}

/* Sello CONFIRMADO que cae con un golpe */
.stamp {
  position: absolute;
  right: 0.25rem;
  bottom: 0.25rem;
  display: grid;
  justify-items: center;
  padding: 0.375rem 0.875rem 0.5rem;
  color: var(--stamp);
  border: 4px double var(--stamp);
  border-radius: var(--radius-control);
  transform: rotate(-12deg);
  mix-blend-mode: multiply;
  animation: stamp-in 0.45s cubic-bezier(0.3, 1.5, 0.5, 1) 0.8s both;
}
.stamp span {
  font-size: 1.75rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
  letter-spacing: 0.06em;
  line-height: 1.05;
  text-transform: uppercase;
}
.stamp small {
  font-size: 0.625rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
@media (min-width: 720px) {
  .stamp {
    right: -1rem;
  }
}
@keyframes stamp-in {
  0% {
    opacity: 0;
    transform: rotate(-12deg) scale(2.8);
  }
  55% {
    opacity: 0.95;
    transform: rotate(-12deg) scale(0.92);
  }
  100% {
    opacity: 0.9;
    transform: rotate(-12deg) scale(1);
  }
}
</style>
