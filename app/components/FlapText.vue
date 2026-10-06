<script setup lang="ts">
/**
 * Texto en fichas de panel de aeropuerto (split-flap). Cuando cambia `text`, solo giran las fichas
 * cuyo carácter cambia. Es decorativo (`aria-hidden`): quien lo use debe dar el texto accesible aparte.
 * Con `prefers-reduced-motion` cambia sin animación.
 */
const props = withDefaults(
  defineProps<{
    text: string
    length?: number
    delay?: number
    /** Vueltas de cada ficha antes de asentarse: [mínimo, máximo]. */
    spins?: [number, number]
  }>(),
  { length: undefined, delay: 0, spins: () => [3, 7] },
)

const NBSP = '\u00a0'
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
const size = computed(() => props.length ?? props.text.length)

function pad(text: string): string[] {
  return text.toUpperCase().padEnd(size.value, ' ').slice(0, size.value).split('')
}

// En servidor se pinta ya el texto final: sin JavaScript el panel se lee igual.
const chars = ref<string[]>(pad(props.text))
const flips = ref<number[]>(chars.value.map(() => 0))
const timers = new Set<ReturnType<typeof setTimeout>>()

function later(fn: () => void, ms: number) {
  const id = setTimeout(() => {
    timers.delete(id)
    fn()
  }, ms)
  timers.add(id)
}

function animate(text: string, baseDelay: number, scrambleAll = false) {
  const target = pad(text)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.forEach((finalChar, i) => {
    const changes = chars.value[i] !== finalChar
    if (!changes && !(scrambleAll && finalChar !== ' ')) return
    if (reduce) {
      chars.value[i] = finalChar
      return
    }
    const [min, max] = props.spins
    const steps = min + Math.floor(Math.random() * (max - min + 1))
    let step = 0
    const tick = () => {
      step++
      const done = step >= steps
      chars.value[i] = done ? finalChar : CHARSET[Math.floor(Math.random() * CHARSET.length)]!
      flips.value[i]!++
      if (!done) later(tick, 70)
    }
    later(tick, baseDelay + i * 35)
  })
}

watch(
  () => props.text,
  (text) => animate(text, 0),
)
onMounted(() => animate(props.text, props.delay, true))
onBeforeUnmount(() => timers.forEach(clearTimeout))
</script>

<template>
  <span class="flapt" aria-hidden="true"
    ><span v-for="(ch, i) in chars" :key="`${i}-${flips[i]}`" class="flapt__tile">{{
      ch === ' ' ? NBSP : ch
    }}</span></span
  >
</template>

<style scoped>
.flapt {
  display: inline-flex;
  gap: 0.1em;
  perspective: 30em;
}
.flapt__tile {
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 0.92em;
  height: 1.3em;
  font-weight: 700;
  font-stretch: 85%;
  line-height: 1;
  background: linear-gradient(#2c2c2f 0 49.5%, #232326 50.5% 100%);
  border-radius: 0.12em;
  animation: flap 0.1s ease-out;
}
.flapt__tile::after {
  content: '';
  position: absolute;
  inset: 50% 0 auto;
  height: 1px;
  background: rgb(0 0 0 / 0.75);
}
@keyframes flap {
  from {
    transform: rotateX(-80deg);
    filter: brightness(1.8);
  }
}
@media (prefers-reduced-motion: reduce) {
  .flapt__tile {
    animation: none;
  }
}
</style>
