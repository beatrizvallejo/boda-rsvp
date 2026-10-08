<script setup lang="ts">
// Juego de preguntas de pareja que desvela la contraseña del panel («control de seguridad»). Un solo
// móvil por turnos: contesta uno, el otro no mira, contesta el otro y se revelan las dos respuestas.
// En las libres deciden ellos si coinciden; en «¿Quién de los dos…?» se compara solo. Con GAME_TARGET
// coincidencias, el servidor abre la sesión del panel y devuelve la contraseña. Solo en español.
import type { GameInfo, GamePlayer, GameResult, GameReward } from '#shared/schemas'

type Stage = 'intro' | 'answer' | 'handoff' | 'reveal' | 'lost' | 'sending' | 'won' | 'error'

const NAMES: Record<GamePlayer, string> = { keko: 'Keko', ro: 'Ro' }

const route = useRoute()
const code = String(route.params.code)

useHead({ htmlAttrs: { lang: 'es-ES' }, title: 'Control de seguridad · Keko y Ro' })

const { data: game, error: loadError } = await useFetch<GameInfo>(
  `/api/game/${encodeURIComponent(code)}`,
)

const stage = ref<Stage>('intro')
const index = ref(0)
const turn = ref<0 | 1>(0)
const answers = ref<[string, string]>(['', ''])
const draft = ref('')
const draftError = ref('')
const results = ref<GameResult[]>([])
const password = ref<string | null>(null)
const copied = ref(false)
const answerInput = ref<HTMLInputElement>()

const questions = computed(() => game.value?.questions ?? [])
const target = computed(() => game.value?.target ?? 0)
const question = computed(() => questions.value[index.value])
/** Empieza Keko en las preguntas impares (1, 3…) y Ro en las pares: así se reparte quién espera. */
const order = computed<[GamePlayer, GamePlayer]>(() =>
  index.value % 2 === 0 ? ['keko', 'ro'] : ['ro', 'keko'],
)
const current = computed(() => NAMES[order.value[turn.value]])
const other = computed(() => NAMES[order.value[turn.value === 0 ? 1 : 0]])
const score = computed(
  () =>
    results.value.filter((r) => r.matched === true || (r.picks && r.picks[0] === r.picks[1]))
      .length,
)
/** Respuestas por jugador (no por turno), para mostrarlas siempre en el mismo orden. */
const byPlayer = computed(() => {
  const [first] = order.value
  return first === 'keko'
    ? { keko: answers.value[0], ro: answers.value[1] }
    : { keko: answers.value[1], ro: answers.value[0] }
})
const whoMatched = computed(() => byPlayer.value.keko === byPlayer.value.ro)

function scrollTop() {
  window.scrollTo({ top: 0 })
}

function start() {
  index.value = 0
  results.value = []
  startQuestion()
}

function startQuestion() {
  turn.value = 0
  answers.value = ['', '']
  goAnswer()
}

function goAnswer() {
  draft.value = ''
  draftError.value = ''
  stage.value = 'answer'
  scrollTop()
  if (question.value?.kind === 'free') nextTick(() => answerInput.value?.focus())
}

function submitAnswer(value: string) {
  const answer = value.trim()
  if (!answer) {
    draftError.value = 'Escribe algo, aunque sea «ni idea».'
    answerInput.value?.focus()
    return
  }
  answers.value[turn.value] = answer
  if (turn.value === 0) {
    stage.value = 'handoff'
    scrollTop()
  } else {
    stage.value = 'reveal'
    scrollTop()
  }
}

function afterHandoff() {
  turn.value = 1
  goAnswer()
}

function record(result: GameResult) {
  results.value.push(result)
  const remaining = questions.value.length - results.value.length
  if (score.value >= target.value) return finish()
  if (score.value + remaining < target.value) {
    stage.value = 'lost'
    scrollTop()
    return
  }
  index.value++
  startQuestion()
}

function judge(matched: boolean) {
  record({ id: question.value!.id, matched })
}

function nextWho() {
  record({
    id: question.value!.id,
    picks: [byPlayer.value.keko, byPlayer.value.ro] as [GamePlayer, GamePlayer],
  })
}

async function finish() {
  stage.value = 'sending'
  scrollTop()
  try {
    const reward = await $fetch<GameReward>(`/api/game/${encodeURIComponent(code)}/finish`, {
      method: 'POST',
      body: { results: results.value },
    })
    password.value = reward.password
    useAdminSession().value = null
    stage.value = 'won'
  } catch {
    stage.value = 'error'
  }
}

async function copyPassword() {
  if (!password.value) return
  try {
    await navigator.clipboard.writeText(password.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  } catch {
    // Sin permiso del portapapeles: la contraseña sigue a la vista para copiarla a mano.
  }
}
</script>

<template>
  <main class="game">
    <PublicNotice
      v-if="loadError || !game"
      title="Esta puerta no existe"
      text="Revisa el enlace del control de seguridad. Si te lo han pasado los novios, pídeselo otra vez."
    />

    <template v-else>
      <!-- Marcador: pregunta y puntos -->
      <header v-if="stage === 'answer' || stage === 'handoff' || stage === 'reveal'" class="score">
        <span class="score__brand"><AirlineLogo class="score__logo" /> Control de seguridad</span>
        <span class="score__row">
          <span class="label score__label">Pregunta {{ index + 1 }}/{{ questions.length }}</span>
          <span class="score__points" :aria-label="`${score} de ${target} puntos`">
            <span
              v-for="n in target"
              :key="n"
              class="score__dot"
              :class="{ 'score__dot--on': n <= score }"
              aria-hidden="true"
            />
          </span>
        </span>
      </header>

      <!-- Portada -->
      <section v-if="stage === 'intro'" class="board" aria-labelledby="intro-title">
        <p class="board__flap"><FlapText text="CONTROL" /></p>
        <p class="board__kicker">KR 3107 · Solo tripulación</p>
        <h1 id="intro-title" class="board__title">Control de seguridad</h1>
        <BrickCouple class="board__couple" />
        <p class="board__text">
          Antes de daros las llaves del panel, comprobamos que sois vosotros (y no dos impostores
          muy bien compenetrados).
        </p>
        <ol class="rules">
          <li>{{ questions.length }} preguntas y un solo móvil.</li>
          <li>Contesta uno mientras el otro mira al techo. Luego, el otro.</li>
          <li>Se revelan las dos respuestas. Si coinciden, punto.</li>
          <li>
            Con <b>{{ target }} puntos</b> se abre la puerta y os damos la contraseña del panel.
          </li>
        </ol>
        <button type="button" class="btn btn--signal" @click="start">Empezar el control →</button>
      </section>

      <!-- Turno de respuesta (tarjeta blanca: aquí se rellena) -->
      <section v-else-if="stage === 'answer' && question" class="card" aria-labelledby="q-title">
        <header class="card__band">
          <span>Turno de {{ current }}</span>
          <span class="card__section">{{ question.section }}</span>
        </header>
        <div class="card__body">
          <p class="card__emoji" aria-hidden="true">{{ question.emoji }}</p>
          <h1 id="q-title" class="card__question">{{ question.text }}</h1>

          <form
            v-if="question.kind === 'free'"
            class="answer"
            novalidate
            @submit.prevent="submitAnswer(draft)"
          >
            <label for="answer" class="label">Respuesta de {{ current }}</label>
            <input
              id="answer"
              ref="answerInput"
              v-model="draft"
              class="answer__input"
              type="text"
              maxlength="80"
              autocomplete="off"
              autocapitalize="sentences"
              enterkeyhint="done"
              :aria-invalid="draftError ? 'true' : undefined"
              aria-describedby="answer-error"
            />
            <p id="answer-error" class="answer__error" role="alert">{{ draftError }}</p>
            <button type="submit" class="btn btn--ink">Listo, que no lo vea {{ other }}</button>
          </form>

          <div v-else class="who" role="group" aria-labelledby="q-title">
            <button
              v-for="p in ['keko', 'ro'] as const"
              :key="p"
              type="button"
              class="who__option"
              @click="submitAnswer(p)"
            >
              {{ NAMES[p] }}
            </button>
          </div>
        </div>
      </section>

      <!-- Cambio de turno (panel negro: tapa la respuesta) -->
      <section v-else-if="stage === 'handoff'" class="board" aria-labelledby="handoff-title">
        <p class="board__flap board__flap--amber"><FlapText text="NO MIRES" /></p>
        <h1 id="handoff-title" class="board__title">¡No mires, {{ other }}!</h1>
        <p class="board__text">
          {{ current }} ya ha contestado. Pásale el móvil a {{ other }} sin hacer caras raras.
        </p>
        <button type="button" class="btn btn--signal" @click="afterHandoff">
          Soy {{ other }}, ya puedo mirar
        </button>
      </section>

      <!-- Revelación -->
      <section v-else-if="stage === 'reveal' && question" class="card" aria-labelledby="r-title">
        <header class="card__band">
          <span>Respuestas</span>
          <span class="card__section">{{ question.section }}</span>
        </header>
        <div class="card__body">
          <p class="card__emoji" aria-hidden="true">{{ question.emoji }}</p>
          <h1 id="r-title" class="card__question card__question--small">{{ question.text }}</h1>
          <dl class="reveal">
            <div v-for="p in ['keko', 'ro'] as const" :key="p" class="reveal__item">
              <dt class="label">{{ NAMES[p] }}</dt>
              <dd>
                {{ question.kind === 'who' ? NAMES[byPlayer[p] as GamePlayer] : byPlayer[p] }}
              </dd>
            </div>
          </dl>

          <template v-if="question.kind === 'free'">
            <p class="reveal__ask">¿Coincidís? Sed honestos (o no).</p>
            <div class="reveal__actions">
              <button type="button" class="btn btn--signal" @click="judge(true)">
                ¡Coincidimos! 🎉
              </button>
              <button type="button" class="btn btn--line" @click="judge(false)">
                Ni de lejos 🙈
              </button>
            </div>
          </template>
          <template v-else>
            <p class="reveal__verdict" :class="{ 'reveal__verdict--ok': whoMatched }" role="status">
              {{
                whoMatched
                  ? '¡Coincidís! Un punto más 🎉'
                  : 'No coincidís. Esto se habla en casa 🙈'
              }}
            </p>
            <button type="button" class="btn btn--ink" @click="nextWho">Siguiente →</button>
          </template>
        </div>
      </section>

      <!-- Sin puntos suficientes -->
      <section v-else-if="stage === 'lost'" class="board" aria-labelledby="lost-title">
        <p class="board__flap board__flap--amber"><FlapText text="CERRADO" /></p>
        <h1 id="lost-title" class="board__title">Puerta cerrada… de momento</h1>
        <p class="board__text">
          Lleváis {{ score }} {{ score === 1 ? 'coincidencia' : 'coincidencias' }} y ya no llegáis a
          {{ target }}. Ya tenéis tema de conversación para la cena.
        </p>
        <button type="button" class="btn btn--signal" @click="start">Volver a intentarlo</button>
      </section>

      <!-- Enviando / error -->
      <section v-else-if="stage === 'sending'" class="board" aria-live="polite">
        <p class="board__flap"><FlapText text="VERIFICANDO" /></p>
        <p class="board__text">Comprobando vuestras tarjetas de embarque…</p>
      </section>
      <section v-else-if="stage === 'error'" class="board" aria-labelledby="error-title">
        <h1 id="error-title" class="board__title">Se nos ha caído la conexión</h1>
        <p class="board__text">
          Vuestros {{ score }} puntos siguen aquí. Comprobad la conexión y volved a intentarlo.
        </p>
        <button type="button" class="btn btn--signal" @click="finish">Reintentar</button>
      </section>

      <!-- Premio -->
      <section v-else-if="stage === 'won'" class="won" aria-labelledby="won-title">
        <p class="won__flap"><FlapText text="PUERTA ABIERTA" /></p>
        <h1 id="won-title" class="won__title">¡Embarque autorizado!</h1>
        <BrickCouple class="won__couple" wave />
        <template v-if="password">
          <p class="won__text">
            {{ score }} coincidencias: sois vosotros. Esta es la contraseña del panel. Guardadla
            para entrar desde el otro móvil.
          </p>
          <p class="won__password">
            <span class="label">Contraseña del panel</span>
            <code>{{ password }}</code>
          </p>
          <button type="button" class="btn btn--ink" @click="copyPassword">
            {{ copied ? '¡Copiada!' : 'Copiar contraseña' }}
          </button>
        </template>
        <p v-else class="won__text">
          {{ score }} coincidencias: sois vosotros. En desarrollo no hay contraseña: el panel entra
          sin login.
        </p>
        <p class="won__note">En este móvil ya tenéis la sesión abierta.</p>
        <NuxtLink to="/admin" class="btn btn--line won__go">Ir al panel →</NuxtLink>
      </section>
    </template>
  </main>
</template>

<style scoped>
.game {
  display: grid;
  gap: 1rem;
  width: min(30rem, 100% - 2 * var(--gutter));
  margin: 0 auto;
  padding: 1rem 0 2.5rem;
}

/* Marcador */
.score {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}
.score__brand {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: var(--fs-small);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.score__logo {
  width: 1.75rem;
  height: 1.75rem;
}
.score__row {
  display: inline-flex;
  align-items: center;
  gap: 0.625rem;
}
.score__label {
  color: var(--ink);
}
.score__points {
  display: inline-flex;
  gap: 0.25rem;
}
.score__dot {
  width: 0.75rem;
  height: 0.75rem;
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-pill);
}
.score__dot--on {
  background: var(--signal);
}

/* Panel negro: informa */
.board {
  display: grid;
  justify-items: center;
  gap: 0.75rem;
  padding: 2rem 1.25rem 1.75rem;
  text-align: center;
  color: var(--board-ink);
  background: var(--board-light), var(--board);
  border-radius: var(--radius-board);
}
.board__flap {
  margin: 0;
  font-size: clamp(1.25rem, 7vw, 1.75rem);
  color: var(--board-ink);
}
.board__flap--amber {
  color: var(--status-boarding);
}
.board__kicker {
  margin: 0;
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--board-muted);
}
.board__title {
  margin: 0;
  font-size: var(--fs-section);
  font-weight: 800;
  font-stretch: var(--stretch-display);
  line-height: 1.1;
}
.board__couple {
  margin: 0.25rem 0;
}
.board__text {
  max-width: 24rem;
  margin: 0;
  color: var(--board-text);
}
.rules {
  display: grid;
  gap: 0.5rem;
  max-width: 24rem;
  margin: 0.25rem 0 0.5rem;
  padding: 0 0 0 1.25rem;
  text-align: left;
  color: var(--board-text-soft);
}
.rules b {
  color: var(--board-ink);
}

/* Tarjeta blanca: se rellena */
.card {
  overflow: hidden;
  background: var(--paper);
  border-radius: var(--radius-pass);
  box-shadow: var(--shadow-pass);
}
.card__band {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.25rem 1rem;
  padding: 0.75rem 1.25rem;
  font-size: var(--fs-label);
  font-weight: 700;
  font-stretch: var(--stretch-label);
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--on-signal);
  background: var(--signal);
}
.card__section {
  font-weight: 600;
}
.card__body {
  display: grid;
  gap: 1rem;
  padding: 1.5rem 1.25rem 1.5rem;
}
.card__emoji {
  margin: 0;
  font-size: 2.25rem;
  line-height: 1;
}
.card__question {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  font-stretch: var(--stretch-tile);
  line-height: 1.2;
}
.card__question--small {
  font-size: var(--fs-lead);
}

/* Respuesta libre */
.answer {
  display: grid;
  gap: 0.375rem;
}
.answer__input {
  width: 100%;
  min-height: 48px;
  padding: 0.625rem 0.875rem;
  font-size: var(--fs-input);
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-control);
}
.answer__input:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 1px;
}
.answer__input[aria-invalid='true'] {
  border-color: var(--error);
}
.answer__error {
  min-height: 1.25rem;
  margin: 0 0 0.25rem;
  font-size: var(--fs-small);
  color: var(--error);
}

/* ¿Quién de los dos? */
.who {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.who__option {
  min-height: 64px;
  font-size: var(--fs-lead);
  font-weight: 800;
  font-stretch: var(--stretch-display);
  color: var(--ink);
  cursor: pointer;
  background: var(--paper-sunken);
  border: 1.5px solid var(--ink);
  border-radius: var(--radius-button);
}
.who__option:active {
  color: var(--signal);
  background: var(--ink);
}
.who__option:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 2px;
}

/* Revelación */
.reveal {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin: 0;
}
.reveal__item {
  padding: 0.875rem;
  background: var(--paper-sunken);
  border-radius: var(--radius-control);
}
.reveal__item dd {
  margin: 0.25rem 0 0;
  font-size: var(--fs-input);
  font-weight: 700;
  overflow-wrap: anywhere;
}
.reveal__ask {
  margin: 0;
  color: var(--muted);
  text-align: center;
}
.reveal__actions {
  display: grid;
  gap: 0.625rem;
}
.reveal__verdict {
  margin: 0;
  padding: 0.75rem;
  font-weight: 700;
  text-align: center;
  color: var(--pending-ink);
  background: var(--pending-bg);
  border-radius: var(--radius-control);
}
.reveal__verdict--ok {
  color: var(--confirmed-ink);
  background: var(--confirmed-bg);
}

/* Premio: amarillo, como la pantalla de éxito */
.won {
  display: grid;
  justify-items: center;
  gap: 0.875rem;
  padding: 2rem 1.25rem;
  text-align: center;
  color: var(--on-signal);
  background: var(--signal);
  border-radius: var(--radius-board);
}
.won__flap {
  margin: 0;
  padding: 0.5rem 0.625rem;
  font-size: clamp(1rem, 5.2vw, 1.375rem);
  color: var(--status-on-time);
  background: var(--board-light), var(--board);
  border-radius: var(--radius-inner);
}
.won__title {
  margin: 0;
  font-size: var(--fs-section);
  font-weight: 800;
  font-stretch: var(--stretch-display);
  line-height: 1.1;
}
.won__text,
.won__note {
  max-width: 24rem;
  margin: 0;
}
.won__note {
  font-size: var(--fs-small);
}
.won__password {
  display: grid;
  gap: 0.375rem;
  width: 100%;
  margin: 0;
  padding: 1rem;
  background: var(--paper);
  border-radius: var(--radius-control);
}
.won__password .label {
  color: var(--muted);
}
.won__password code {
  font-family: ui-monospace, 'SFMono-Regular', Menlo, monospace;
  font-size: var(--fs-lead);
  font-weight: 700;
  overflow-wrap: anywhere;
  user-select: all;
}
.won .btn {
  width: 100%;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  padding: 0.75rem 1.25rem;
  font-size: 1rem;
  font-weight: 700;
  text-decoration: none;
  cursor: pointer;
  border: 0;
  border-radius: var(--radius-button);
}
.btn:focus-visible {
  outline: 3px solid var(--signal);
  outline-offset: 2px;
}
.btn--signal {
  color: var(--on-signal);
  background: var(--signal);
}
.btn--ink {
  color: var(--signal);
  background: var(--ink);
}
.btn--line {
  color: var(--ink);
  background: var(--paper);
  border: 1.5px solid var(--ink);
}
.won .btn:focus-visible {
  outline-color: var(--ink);
}
</style>
