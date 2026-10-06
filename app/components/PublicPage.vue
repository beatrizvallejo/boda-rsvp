<script setup lang="ts">
/**
 * Armazón de las páginas públicas (`/` y `/r/<token>`): intro (una vez por visita), cabecera, el
 * contenido principal (slot), la flecha hacia "Próximamente", las secciones y los metadatos OG.
 */
const INTRO_KEY = 'kr-intro-visto'
const { t } = useI18n()
const { siteUrl } = useRuntimeConfig().public

// Metadatos en servidor (WhatsApp lee el HTML, no ejecuta JavaScript). Previsualización genérica.
useSeoMeta({
  title: () => t('meta.title'),
  description: () => t('meta.description'),
  ogTitle: () => t('meta.title'),
  ogDescription: () => t('meta.description'),
  ogImage: `${siteUrl}/og.jpg`,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageAlt: () => t('meta.title'),
  ogType: 'website',
  twitterCard: 'summary_large_image',
})

// Antes del primer pintado: si la intro ya se vio en esta visita, no se pinta. La regla va en línea
// (aplicada antes de que llegue cualquier hoja de estilos) y con !important, porque `.intro` del
// componente tiene la misma especificidad y se carga después.
useHead({
  style: [{ tagPosition: 'head', innerHTML: '.intro-off .intro{display:none!important}' }],
  script: [
    {
      tagPosition: 'head',
      innerHTML: `try{if(sessionStorage.getItem('${INTRO_KEY}'))document.documentElement.classList.add('intro-off')}catch(e){}`,
    },
  ],
})

const intro = ref<'visible' | 'gone'>('visible')
function closeIntro() {
  intro.value = 'gone'
  try {
    sessionStorage.setItem(INTRO_KEY, '1')
  } catch {
    // Sin sessionStorage la intro saldría en cada visita: aceptable.
  }
}

// La flecha baja hasta "Próximamente" sin añadir #pronto a la dirección (el href queda para sin JS).
function goToSoon() {
  document.getElementById('pronto')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// Píldora flotante en móvil hacia "Próximamente": solo mientras no se ha hecho scroll.
const atTop = ref(true)
function onScroll() {
  atTop.value = window.scrollY < 120
}
onMounted(() => {
  if (document.documentElement.classList.contains('intro-off')) intro.value = 'gone'
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))
</script>

<template>
  <div>
    <IntroBoard v-if="intro === 'visible'" @close="closeIntro" />

    <SiteHeader :inert="intro === 'visible'" />
    <main :inert="intro === 'visible'">
      <slot />

      <a class="more" href="#pronto" @click.prevent="goToSoon">
        <span>{{ t('more') }}</span>
        <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true">
          <path
            fill="currentColor"
            d="M11 4h2v12l5.5-5.5 1.4 1.4L12 19.8l-7.9-7.9 1.4-1.4L11 16z"
          />
        </svg>
      </a>

      <HowToGetThere />
      <ComingSoon />
      <CrewPhotos />
    </main>

    <!-- Móvil: aviso flotante de que hay más abajo -->
    <a
      class="more-float"
      :class="{ 'is-hidden': !atTop || intro === 'visible' }"
      href="#pronto"
      aria-hidden="true"
      tabindex="-1"
      @click.prevent="goToSoon"
    >
      ✈ {{ t('more') }} <span>↓</span>
    </a>
  </div>
</template>

<style scoped>
.more {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  width: max-content;
  margin: 0.25rem auto 0;
  padding: 0.5rem 1rem;
  font-size: var(--fs-small);
  font-weight: 700;
  font-stretch: 85%;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--ink);
  text-decoration: none;
}
.more svg {
  width: 2.5rem;
  height: 2.5rem;
  padding: 0.5rem;
  background: var(--signal);
  border-radius: 50%;
  animation: nudge 1.6s ease-in-out infinite;
}
@keyframes nudge {
  50% {
    transform: translateY(6px);
  }
}

.more-float {
  position: fixed;
  left: 50%;
  bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 40;
  display: inline-flex;
  gap: 0.5rem;
  align-items: center;
  padding: 0.75rem 1.125rem;
  font-size: var(--fs-small);
  font-weight: 700;
  color: var(--on-signal);
  white-space: nowrap;
  text-decoration: none;
  background: var(--signal);
  border-radius: 999px;
  box-shadow: 0 8px 20px -6px rgb(0 0 0 / 0.35);
  transform: translateX(-50%);
  transition:
    opacity 0.3s,
    transform 0.3s;
}
.more-float span {
  animation: nudge 1.6s ease-in-out infinite;
}
.more-float.is-hidden {
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 1rem);
}
@media (min-width: 720px) {
  .more-float {
    display: none;
  }
}
</style>
