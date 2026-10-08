<script setup lang="ts">
// Plantilla de la imagen Open Graph (1200×630) de la previsualización de WhatsApp. Solo existe en
// desarrollo: `pnpm og` la abre con Playwright y la guarda en `public/og.jpg`. Reutiliza los
// componentes reales (fichas, muñecos, logo) para que la imagen siga el panel de la intro.
if (!import.meta.dev) throw createError({ statusCode: 404 })

definePageMeta({ layout: false })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>

<template>
  <div class="og">
    <header class="og__top">
      <p class="og__kind">
        <PlaneIcon :rotate="135" />
        <b>Llegadas</b> <span>Sosiri · Arrivals</span>
      </p>
      <p class="og__flight">
        <span>KR 3107</span>
        <AirlineLogo class="og__logo" />
      </p>
    </header>

    <div class="og__hero">
      <div class="og__names">
        <BrickCouple class="og__couple" />
        <FlapText text="KEKO Y RO" />
      </div>
      <p class="og__lead">¡Nos casamos! · Ne căsătorim!</p>
      <p class="og__route">
        <FlapText text="MADRID" class="og__tiles" />
        <span class="og__arrow">→</span>
        <FlapText text="ALBA" class="og__tiles" />
        <span class="og__date">31 JUL 2027 · 13:00</span>
      </p>
    </div>

    <p class="og__band">Tu tarjeta de embarque está lista · Confirma tu asistencia</p>
  </div>
</template>

<style scoped>
.og {
  --tile-ink: var(--board-ink);
  display: flex;
  flex-direction: column;
  width: 1200px;
  height: 630px;
  overflow: hidden;
  color: var(--board-ink);
  background:
    var(--board-light), radial-gradient(120% 60% at 50% 0%, var(--board-glow) 0%, transparent 70%),
    var(--board);
}
.og__top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 128px;
  padding: 0 48px;
  border-bottom: 1px solid var(--board-line);
}
.og__kind {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 0;
  font-size: 26px;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.og__kind svg {
  width: 34px;
  height: 34px;
}
.og__kind b {
  font-weight: 800;
}
.og__kind span {
  color: var(--board-muted);
}
.og__flight {
  display: flex;
  gap: 22px;
  align-items: center;
  margin: 0;
  font-size: 26px;
  font-weight: 800;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  color: var(--status-boarding);
}
/* El logo, protagonista: a unos 100px se reconoce aún en la miniatura de WhatsApp (~330px de ancho).
   Un anillo fino lo separa del negro del panel. */
.og__logo {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  box-shadow: 0 0 0 2px var(--board-line);
}
.og__hero {
  display: grid;
  flex: 1;
  align-content: center;
  justify-items: center;
  gap: 26px;
}
.og__names {
  display: flex;
  gap: 40px;
  align-items: center;
  font-size: 82px;
}
.og__couple {
  height: 104px;
}
.og__lead {
  margin: 0;
  font-size: 32px;
  font-weight: 800;
  color: var(--signal);
}
.og__route {
  display: flex;
  gap: 22px;
  align-items: center;
  margin: 0;
}
.og__tiles {
  font-size: 30px;
}
.og__arrow {
  font-size: 26px;
  color: var(--board-muted);
}
.og__date {
  margin-left: 12px;
  font-size: 30px;
  font-weight: 700;
}
.og__band {
  display: grid;
  place-items: center;
  height: 74px;
  margin: 0;
  font-size: 24px;
  font-weight: 800;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--on-signal);
  background: var(--signal);
}
</style>
