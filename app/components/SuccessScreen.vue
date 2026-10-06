<script setup lang="ts">
// Pantalla de éxito tras confirmar: amarilla a pantalla completa, novios saludando y la tarjeta con el
// sello CONFIRMADO que cae con un golpe. Se cierra tocando cualquier parte (o con Escape).
const props = defineProps<{ passengers: string[] }>()
const emit = defineEmits<{ close: [] }>()
const { t } = useI18n()

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

const PLANE =
  'M21 16v-2l-8-5V3.5a1.5 1.5 0 0 0-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z'
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
      <p class="success__kicker" aria-hidden="true">KR 3107 · {{ t('pass.fromValue') }} → Alba</p>
      <h2 id="success-title" class="success__title">{{ t('success.title') }}</h2>
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
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path fill="currentColor" :d="PLANE" transform="rotate(90 12 12)" />
              </svg>
              <div class="issued__to">
                <span class="label">{{ t('pass.to') }}</span
                ><b>Alba</b>
              </div>
            </div>
            <dl class="issued__info">
              <div class="issued__pax">
                <dt class="label">{{ t('pass.passengers') }}</dt>
                <dd>{{ props.passengers.join(' · ') }}</dd>
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
            <small>KR3107 · 31 JUL 2027 · Alba</small>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  place-items: center;
  overflow: hidden auto;
  padding: 2rem 1.25rem max(2rem, env(safe-area-inset-bottom));
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
  filter: drop-shadow(2.5px 0 0 #fff) drop-shadow(-2.5px 0 0 #fff) drop-shadow(0 2.5px 0 #fff)
    drop-shadow(0 -2.5px 0 #fff) drop-shadow(0 6px 8px rgb(0 0 0 / 0.25));
}
@media (min-width: 720px) {
  .success__stage {
    flex-direction: row;
    justify-content: center;
    align-items: flex-end;
    gap: 2rem;
  }
  .success__couple {
    height: 132px;
  }
}

/* Tarjeta emitida */
.issued {
  position: relative;
  width: min(100%, 25rem);
  text-align: left;
  background: var(--paper);
  border-radius: 18px;
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
  border-radius: 18px 18px 0 0;
}
.issued__airline {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  font-size: 1rem;
  font-stretch: 100%;
  letter-spacing: 0;
  text-transform: none;
  color: #fff;
}
.issued__mono {
  width: 1.75rem;
  height: 1.75rem;
  box-shadow: 0 0 0 1.5px #fff;
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
  border-radius: 10px;
  transform: rotate(-12deg);
  mix-blend-mode: multiply;
  animation: stamp-in 0.45s cubic-bezier(0.3, 1.5, 0.5, 1) 0.8s both;
}
.stamp span {
  font-size: 1.75rem;
  font-weight: 900;
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
