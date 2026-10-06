<script setup lang="ts">
// Los novios como muñequitos de bloques (dibujo propio, sin marca): él calvo, con barba oscura con
// canas, traje, pajarita y la maleta del vuelo; ella rubia de melena larga, con velo y ramo. Se balancean por turnos y entre los
// dos sube un corazón. Con `wave` saludan (él con la mano, ella levantando el ramo).
// Tamaño: 76px de alto por defecto (width/height del SVG); quien lo usa fija la altura con su clase. Sin
// height: 100% propio: si este CSS llega antes que el del contenedor, los muñecos se ven gigantes.
const props = withDefaults(defineProps<{ wave?: boolean }>(), { wave: false })
// Id único del recorte de la barba: puede haber dos parejas en la misma página (intro y pantalla de éxito).
const headClip = useId()
</script>

<template>
  <svg class="couple" viewBox="0 0 120 92" width="99" height="76" aria-hidden="true">
    <defs>
      <clipPath :id="headClip">
        <rect x="9" y="4" width="20" height="18" rx="8" />
      </clipPath>
    </defs>
    <!-- Novio -->
    <g class="couple__groom">
      <g transform="translate(10 8)">
        <!-- cuello y cabeza redondeada -->
        <rect x="15" y="21" width="8" height="3" class="skin" />
        <rect x="9" y="4" width="20" height="18" rx="8" class="skin" />
        <ellipse cx="15" cy="7.6" rx="3" ry="1.6" fill="#fff" opacity="0.55" />
        <circle cx="15.5" cy="12.5" r="1.3" class="eye" />
        <circle cx="22.5" cy="12.5" r="1.3" class="eye" />
        <!-- barba oscura con canas, recortada al contorno de la cabeza; hueco para la sonrisa -->
        <g :clip-path="`url(#${headClip})`">
          <path
            d="M5 13.5 Q10.6 14.4 11.8 16.4 Q14 14.6 19 14.8 Q24 14.6 26.2 16.4 Q27.4 14.4 33 13.5 V30 H5Z"
            class="beard"
          />
          <path
            d="M10.4 16.6 l0.5 2.2 M12.6 20.4 l0.9 1.3 M27.6 16.9 l-0.4 2 M25.6 20.6 l-0.8 1.2 M19.4 21.6 v1.2 M17 15.6 l1.4 -0.2 M22.6 15.8 l-1.2 -0.3"
            class="beard__grey"
          />
        </g>
        <ellipse cx="19" cy="18" rx="4.1" ry="2" class="skin" />
        <path d="M16.2 17.5 Q19 19.7 21.8 17.5" class="smile" />
        <!-- brazos -->
        <g v-if="props.wave" class="couple__wave">
          <path d="M8 26 L2 11 L6 9.5 L11.5 24Z" class="suit" />
          <circle cx="3.6" cy="8.5" r="3" class="skin" />
        </g>
        <template v-else>
          <path d="M8 25 L3 40 L7 42 L11 30Z" class="suit" />
          <circle cx="4.5" cy="43" r="3" class="skin" />
        </template>
        <path d="M30 25 L35 40 L31 42 L27 30Z" class="suit" />
        <circle cx="33.5" cy="43" r="3" class="skin" />
        <!-- torso -->
        <path d="M8 24 H30 L34 50 H4Z" class="suit" />
        <path d="M15 24 H23 L19 35Z" fill="#fff" />
        <path d="M15.5 25.5 L19 27.2 L15.5 29Z M22.5 25.5 L19 27.2 L22.5 29Z" fill="#d7263d" />
        <!-- maleta -->
        <path d="M35 45 V42.5 H41 V45" fill="none" stroke="#6b3a10" stroke-width="1.6" />
        <rect x="31" y="45" width="15" height="12" rx="2" fill="#b5651d" />
        <rect x="33" y="48" width="8" height="4.5" rx="0.8" fill="#f5f3ee" />
        <text x="37" y="51.6" class="tag">KR</text>
        <!-- piernas -->
        <rect x="4" y="50" width="30" height="5" fill="#262935" />
        <rect x="4" y="55" width="14" height="24" rx="1" class="suit" />
        <rect x="20" y="55" width="14" height="24" rx="1" class="suit" />
      </g>
    </g>

    <!-- Novia -->
    <g class="couple__bride">
      <g transform="translate(66 8)">
        <!-- velo -->
        <path d="M6 7 Q19 -3 32 7 L37 56 Q19 61 1 56Z" fill="#fff" opacity="0.32" />
        <!-- melena (detrás) -->
        <path d="M7 11 Q7 1 19 1 Q31 1 31 11 L33 40 Q30 43 26 40 H12 Q8 43 5 40Z" class="hair" />
        <!-- cabeza -->
        <rect x="9" y="4" width="20" height="18" rx="5" class="skin" />
        <path d="M9 12 Q9 3 16 3 H22 Q29 3 29 12 V14 Q27 7 19 7 Q11 7 9 14Z" class="hair" />
        <circle cx="14" cy="3.5" r="1.2" fill="#fff" />
        <circle cx="19" cy="2.5" r="1.2" fill="#fff" />
        <circle cx="24" cy="3.5" r="1.2" fill="#fff" />
        <circle cx="15.5" cy="13.5" r="1.3" class="eye" />
        <circle cx="22.5" cy="13.5" r="1.3" class="eye" />
        <circle cx="13.2" cy="17" r="1.6" fill="#f08a9b" opacity="0.6" />
        <circle cx="24.8" cy="17" r="1.6" fill="#f08a9b" opacity="0.6" />
        <path d="M15 17 Q19 20.5 23 17" class="smile" />
        <rect x="15" y="21" width="8" height="3" class="skin" />
        <!-- brazos -->
        <path d="M8 25 L3 40 L7 42 L11 30Z" class="dress" />
        <circle cx="4.5" cy="43" r="3" class="skin" />
        <path v-if="!props.wave" d="M30 25 L35 40 L31 42 L27 30Z" class="dress" />
        <circle v-if="!props.wave" cx="33.5" cy="43" r="3" class="skin" />
        <!-- torso y falda -->
        <path d="M8 24 H30 L34 50 H4Z" class="dress" />
        <!-- mechones sobre los hombros -->
        <path d="M9 14 Q7 26 9 38 Q11 39.5 13 37 L13 22Z" class="hair" />
        <path d="M29 14 Q31 26 29 38 Q27 39.5 25 37 L25 22Z" class="hair" />
        <path d="M14 24 Q19 29 24 24" fill="none" stroke="#d9d4ca" stroke-width="1" />
        <path d="M4 50 H34 L39 79 H-1Z" class="dress" />
        <path d="M19 52 V78" stroke="#e4dfd5" stroke-width="1" />
        <!-- ramo (en alto al saludar) -->
        <g v-if="props.wave" class="couple__wave couple__wave--bride">
          <path d="M30 26 L36 11 L32 9.5 L26.5 24Z" class="dress" />
          <rect x="33.4" y="2" width="2" height="9" rx="1" fill="#3f8f4f" />
          <circle cx="34.4" cy="9" r="3" class="skin" />
          <circle cx="31.9" cy="2.5" r="3" fill="#e85d75" />
          <circle cx="36.9" cy="2" r="3" fill="#f6a5b5" />
          <circle cx="34.4" cy="-1" r="3" fill="#ffffff" />
          <circle cx="34.4" cy="3" r="2.4" fill="#d7263d" />
        </g>
        <g v-else>
          <rect x="33" y="44" width="2" height="9" rx="1" fill="#3f8f4f" />
          <circle cx="31.5" cy="43" r="3" fill="#e85d75" />
          <circle cx="36.5" cy="42.5" r="3" fill="#f6a5b5" />
          <circle cx="34" cy="39.5" r="3" fill="#ffffff" />
          <circle cx="34" cy="43.5" r="2.4" fill="#d7263d" />
        </g>
      </g>
    </g>

    <!-- Corazón -->
    <path
      class="couple__heart"
      d="M60 30 C 56 25, 50 28, 53 33 L 60 40 L 67 33 C 70 28, 64 25, 60 30Z"
      fill="#e85d75"
    />
  </svg>
</template>

<style scoped>
.couple {
  display: block;
  width: auto;
  overflow: visible;
}
.skin {
  fill: #ffd23f;
}
.suit {
  fill: #3a3e52;
}
.beard {
  fill: #2e2420;
}
.beard__grey {
  fill: none;
  stroke: #c9c4bd;
  stroke-width: 0.55;
  stroke-linecap: round;
  opacity: 0.85;
}
.hair {
  fill: #d8962a;
}
.dress {
  fill: #f7f4ee;
}
.eye {
  fill: #1b1b1b;
}
.smile {
  fill: none;
  stroke: #1b1b1b;
  stroke-width: 1.3;
  stroke-linecap: round;
}
.tag {
  font:
    700 3.6px/1 system-ui,
    sans-serif;
  text-anchor: middle;
  fill: #1b1b1b;
}

/* Saludo: el brazo levantado se mueve desde el hombro */
.couple__wave {
  transform-box: fill-box;
  transform-origin: 85% 95%;
  animation: wave 0.7s ease-in-out infinite alternate;
}
.couple__wave--bride {
  transform-origin: 15% 95%;
  animation-delay: -0.35s;
}
@keyframes wave {
  from {
    transform: rotate(-14deg);
  }
  to {
    transform: rotate(10deg);
  }
}

/* Balanceo por turnos */
.couple__groom,
.couple__bride {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  animation: sway 1.8s ease-in-out infinite;
}
.couple__bride {
  animation-delay: -0.9s;
}
@keyframes sway {
  0%,
  100% {
    transform: rotate(-3deg) translateY(0);
  }
  50% {
    transform: rotate(3deg) translateY(-2px);
  }
}

/* Corazón que sube y se desvanece */
.couple__heart {
  transform-box: fill-box;
  transform-origin: 50% 100%;
  opacity: 0;
  animation: heart 3.6s ease-out 1.5s infinite;
}
@keyframes heart {
  0% {
    opacity: 0;
    transform: translateY(8px) scale(0.4);
  }
  20% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
  60% {
    opacity: 0;
    transform: translateY(-22px) scale(1.1);
  }
  100% {
    opacity: 0;
    transform: translateY(-22px) scale(1.1);
  }
}
</style>
