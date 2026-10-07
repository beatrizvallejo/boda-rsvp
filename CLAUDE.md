# Web de boda: RSVP + panel de los novios

Boda el sábado 31 de julio de 2027 en Rumanía.

- Los invitados confirman asistencia en una web pública: su nombre, el de su acompañante y los campos que se acuerden.
- Los novios consultan las respuestas en un panel privado, reciben un email con cada confirmación y envían las invitaciones por WhatsApp.
- **Concepto: el formulario es un billete de avión** (ver `.claude/skills/wedding-design/references/concepto-billete.md`).

## Quién trabaja aquí y cómo se reparte el trabajo

- **Fases 0–6: frontend y diseño.** Las lleva una frontend developer con experiencia: no le expliques lo básico de Vue o Nuxt. Toda la aplicación funciona en local **sin servicios externos**, gracias a adaptadores locales (ver "Arquitectura").
- **Fases 7–9: puesta en producción.** Infraestructura, almacén de datos (KV), email y deploy, con un compañero de devops.
- **Preguntas de infraestructura** (hosting, almacén KV, backups, DNS, email en producción…):
  - No se las hagas a la persona de frontend ni bloquees el trabajo por ellas.
  - Añádelas a `docs/devops-preguntas.md` con el formato del archivo, avisa en una línea de que las has añadido y continúa con el adaptador local.
  - Si quien trabaja en la sesión es el propio devops (te lo dirá), pregúntale directamente y registra la respuesta en ese archivo.
- `docs/produccion.md` es el documento para devops. Actualízalo cuando una decisión de desarrollo afecte a producción, por ejemplo un campo nuevo o un endpoint nuevo.

## Cómo trabajamos (léelo antes de cada tarea)

- `PLAN.md` es la fuente de verdad del progreso. `docs/brief.md` contiene los requisitos y `docs/decisions.md` las decisiones tomadas.
- Especificaciones de referencia:
  - `docs/mobile-checklist.md`: obligatorio en todo lo visible;
  - `docs/whatsapp.md`: funcionalidad de WhatsApp.
- **Cada fase empieza con preguntas.** Antes de escribir código, resuelve las "Preguntas de entrada" de la fase:
  - Usa la herramienta `AskUserQuestion` si está disponible. Si no, pregunta en texto.
  - Agrupa como mucho 3–4 preguntas por tanda y ofrece una opción recomendada cuando la haya.
  - No preguntes lo que ya esté respondido en `docs/brief.md` o `docs/decisions.md`.
  - Si durante la fase surge una duda que cambia el resultado, para y pregunta. Si no lo cambia, decide tú y regístralo.
- **Cierre de fase (checkpoint):**
  1. Comprueba el criterio de "Terminado cuando".
  2. Resume lo hecho en 5–10 líneas y pide validación explícita.
  3. Solo con el visto bueno: marca la casilla en `PLAN.md`, añade las decisiones a `docs/decisions.md` y haz un commit (`fase N: <resumen>`).
- **Versiones y comandos:** no confíes en tu memoria para versiones de Nuxt, módulos o Playwright. Comprueba la documentación oficial o `npm view` antes de instalar.

## Arquitectura

- **Principio: sencillez.** Es una web familiar, no un producto: prima que funcione bien con las mínimas piezas. Sin servicios externos salvo hosting, KV y email; nada de defensas o capas pensadas para tráfico hostil si el diseño ya lo evita (p. ej., enlaces con código aleatorio en lugar de rate limit).

- **Nuxt 4** (Vue 3, TypeScript estricto, SSR).
- **El frontend solo habla con `server/api/*`.** Nunca accede directamente a una base de datos ni a un servicio externo. El contrato de la API (rutas, entradas y salidas) se define con esquemas Zod compartidos y no cambia al pasar a producción.
- **Adaptadores** en `server/utils/adapters/`. Cada uno tiene una interfaz TypeScript y se elige por variable de entorno:

| Adaptador | Desarrollo (fases 0–6) | Producción (fase 8) |
|---|---|---|
| `data` (`DATA_ADAPTER`) | `local`: Nitro storage con driver `fs` en `.data/` | `kv`: el mismo código con un driver KV del hosting |
| `auth` (`AUTH_ADAPTER`) | `dev`: acceso al panel sin login | `password`: contraseña compartida de los novios + cookie de sesión firmada (se construye en la Fase 5) |
| `notifier` (`NOTIFIER_ADAPTER`) | `console`: imprime el aviso en el log | `gmail`: `nodemailer` + Gmail SMTP |

- **Salvaguarda del adaptador `dev` de auth:** si el servidor arranca en producción (`!import.meta.dev`) con `AUTH_ADAPTER=dev`, debe lanzar un error y no arrancar. Nunca debe existir un acceso sin login en producción.
- **Datos de ejemplo:** `server/fixtures/` contiene invitaciones y respuestas inventadas con nombres realistas (españoles y rumanos), acompañantes y casos límite. Un script `seed` las carga y otro `reset` vacía `.data/`.
- **WhatsApp:** enlaces de envío (`api.whatsapp.com/send`), Web Share API y Open Graph, sin API de WhatsApp Business.
- **Tests e2e:** Playwright, con proyectos móviles. Se ejecutan siempre contra los adaptadores locales.

## Desarrollo local

- El servidor de desarrollo lo arranca el usuario en su terminal. No lances `dev` como proceso de larga duración.
  - Antes de usar Playwright MCP, comprueba que `http://localhost:3000` responde. Si no responde, pide al usuario que lo arranque.
  - `dev:mobile` sirve la web en la red local para probar en un móvil real.
- No hace falta ninguna cuenta externa hasta la Fase 8.
- **Previsualización de WhatsApp:** no se puede probar desde `localhost`. En local, valida con `curl` que los metadatos OG están en el HTML del servidor. La prueba real se hace en la Fase 9.

## Reglas fijas

- **Móvil primero:** todo lo visible cumple `docs/mobile-checklist.md`. Una pantalla no está terminada hasta verificarla a 360px.
- **Diseño:** desde que la skill `wedding-design` está COMPLETADA (Fase 3), se sigue sin excepciones.
- **Zona horaria:** todas las horas del evento están en `Europe/Bucharest`.
  - Se muestran como hora local de Rumanía, indicándolo cuando haga falta (está una hora por delante de España).
  - El `.ics` usa `TZID=Europe/Bucharest`, nunca horas "flotantes".
- **Metáfora del billete:** nunca pidas documentos de identidad, pasaportes ni datos de vuelos reales. La metáfora no va por delante de la legibilidad ni de un `label` real en cada campo.
- **Endpoint de RSVP:**
  - orden: validación → token → guardado → notificación;
  - un fallo del notifier se registra en el log y nunca bloquea ni revierte el guardado.
- Los metadatos Open Graph de las páginas públicas se renderizan en servidor (`useSeoMeta`).
- Las URLs de WhatsApp se construyen siempre con `encodeURIComponent` y apuntan a `api.whatsapp.com/send`, no a `wa.me` (su redirección estropea emojis; ver `docs/whatsapp.md`).
- No leas ni edites `.env*`, salvo `.env.example`.
- Todo el copy va en español (y en los idiomas que fije el brief), en el tono de la skill `wedding-design`.
- **Datos personales:** recoge solo los campos del brief, sin datos de salud salvo decisión registrada. El teléfono solo se guarda si así se decidió.

## Comandos

Requiere Node 22 (`.nvmrc`; Nuxt 4.5 pide `^22.19 || ^24.11 || >=26`): `nvm use` antes de nada. Gestor: pnpm 12 (vía corepack, fijado en `packageManager`).

- dev: `pnpm dev`
- dev:mobile: `pnpm dev:mobile` (escucha en `0.0.0.0:3000`; abre `http://<IP-local>:3000` en el móvil)
- build / preview: `pnpm build` · `pnpm preview`
- seed / reset de datos locales: `pnpm seed` (vacía `.data/db` y carga `server/fixtures/`; enlaces del tipo `/r/ana-garcia-lopez-demo01`) · `pnpm reset` (solo vacía)
- typecheck: `pnpm typecheck` (`nuxt typecheck` con `vue-tsc`)
- lint: `pnpm lint` (ESLint + `prettier --check`) · `pnpm lint:fix` para corregir
- test e2e: `pnpm test:e2e` (contra `http://localhost:3000` o `PLAYWRIGHT_BASE_URL`; proyectos `android-360`, `iphone`, `desktop`)

## Definición de terminado (cualquier tarea)

- `typecheck` y `lint` en verde.
- Los flujos tocados funcionan en el navegador. Compruébalo con Playwright MCP a 360px y a 1280px cuando haya UI.
- Sin secretos en el cliente ni en el repo.
