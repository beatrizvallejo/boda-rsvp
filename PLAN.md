# Plan

Estado: marca `[x]` solo tras la validación del usuario en el checkpoint. `/siguiente` ejecuta la primera fase sin marcar.

- **Bloque A, fases 0–6: frontend y diseño.** Todo en local, sin cuentas externas.
- **Bloque B, fases 7–9: puesta en producción**, con devops.

Referencias transversales: `docs/mobile-checklist.md`, `docs/whatsapp.md`. Las preguntas de infraestructura que surjan en el bloque A van a `docs/devops-preguntas.md` y no bloquean.

---

# Bloque A — Frontend y diseño

## [x] Fase 0 — Entorno y esqueleto

**Preguntas de entrada**
- Gestor de paquetes. Recomendado: pnpm.
- ¿El diseño está en Figma? Si no, elimina `figma` de `.mcp.json`.

**Tareas**
- Comprueba las versiones de Node y del gestor de paquetes frente a los requisitos actuales de Nuxt 4.
- Genera un proyecto Nuxt 4 en una carpeta temporal y mueve sus archivos aquí, **sin sobrescribir** los de este repo (`README.md`, `CLAUDE.md`, `PLAN.md`, `docs/`, `.claude/`, `.mcp.json`). Fusiona `.gitignore` y asegúrate de que `.data/` está ignorado.
- Instala y configura TypeScript estricto, `@nuxt/eslint`, Prettier, Zod y Playwright.
- Añade los scripts `dev`, `dev:mobile`, `build`, `typecheck`, `lint` y `test:e2e`.
- Completa la sección "Comandos" de `CLAUDE.md`.
- Pide al usuario que cree `.env` copiando `.env.example`. Para desarrollo no hay que rellenar nada.
- Haz el commit.

**Terminado cuando**: el usuario confirma que `dev` arranca en su terminal, y `typecheck` y `lint` están en verde.

---

## [x] Fase 1 — Briefing (sin código)

**Preguntas de entrada** (en tandas)
1. Datos básicos: nombres de los novios, ciudad y lugar en Rumanía, dirección para mapas, horarios (hora local) y fecha límite para confirmar. La fecha y el país ya están en el brief.
2. Idiomas: ¿de qué países vienen los invitados? Si hay invitados rumanos, propón español + rumano (¿e inglés?) con `@nuxtjs/i18n` desde el principio.
3. Modelo de acceso:
   - **Enlace personal por invitación** (`/r/<token>`, recomendado): evita respuestas de desconocidos y duplicados, permite editar, precarga los nombres y hace útil el envío por WhatsApp. Además, en producción no necesita captcha.
   - **Formulario abierto**: más simple, pero con duplicados, sin edición y con captcha en producción.
4. Campos: asistencia, acompañante (siempre permitido, según invitación o nunca), niños, menú, transporte, comentarios y email del invitado (opcional).
5. Logística de viaje: propón como mucho 2–3 campos (ciudad de origen, que encaja con el "Desde" del billete; fecha de llegada; traslado o alojamiento).
6. Alergias o intolerancias: son datos de salud (categoría especial del RGPD). Recomienda un campo libre "Comentarios para el catering". Registra la decisión.
7. WhatsApp (ver `docs/whatsapp.md`): ¿guardar el teléfono de cada invitación?, previsualización genérica o personalizada, y borradores de los mensajes de invitación y recordatorio.
8. Panel: qué métricas quieren ver y desde qué dispositivo lo usarán.
9. Privacidad: fecha de borrado de los datos tras la boda.

**Tareas**
- Completa `docs/brief.md`. No escribas código.
- Si alguna respuesta afecta a producción (por ejemplo, formulario abierto implica captcha), refléjalo en `docs/produccion.md`.

**Terminado cuando**: `docs/brief.md` no tiene apartados "(pendiente)" y el usuario lo valida.

---

## [ ] Fase 2 — Contrato de datos y adaptadores locales

**Preguntas de entrada**
- Presenta el modelo de datos derivado del brief (entidades, campos, restricciones) y el contrato de la API (endpoints con su entrada y salida). Pide confirmación antes de implementar.

Referencia del modelo, a adaptar:
- *Modo invitación*:
  - `Invitation` (id, token aleatorio ≥128 bits, etiqueta del grupo, nombres precargados, teléfono opcional, acompañante permitido, maxGuests, invitedSentAt, reminderSentAt);
  - `Rsvp` (invitationId único, asistencia, nombres, campos del brief, timestamps);
  - `MessageTemplate` (`invitation` / `reminder`).
- *Modo abierto*: `Rsvp` sin `invitationId`.

**Tareas**
- Esquemas Zod compartidos y tipos derivados. Son la única fuente del modelo.
- Interfaces de los adaptadores `data`, `auth` y `notifier`, y sus implementaciones locales (`local`, `dev`, `console`), con selección por variable de entorno.
- La salvaguarda que impide arrancar en producción con `AUTH_ADAPTER=dev`.
- Endpoints de `server/api/*` según el contrato, de momento con un rate limit en memoria (en producción lo decide devops: P04).
- Fixtures realistas con casos límite: nombres largos, diacríticos rumanos (ș, ț, ă, î, â), sin acompañante, respuestas negativas y pendientes. Scripts `seed` y `reset`.
- Instala `@nuxtjs/i18n` (el brief fija ES + RO). Cada `Invitation` guarda su idioma (`es`/`ro`) y un teléfono opcional. Las `MessageTemplate` existen por tipo e idioma.
- Actualiza `docs/produccion.md` con el modelo y el contrato. Devops lo necesitará para la Fase 8.

**Revisión**: `security-reviewer`, centrado en la validación, la salvaguarda del adaptador `dev` y que ningún componente del frontend acceda a datos sin pasar por la API.

**Terminado cuando**: los endpoints responden con los datos de seed (comprobado con `curl`), los datos inválidos se rechazan y arrancar el build de producción con `AUTH_ADAPTER=dev` falla.

---

## [ ] Fase 3 — Diseño

**Preguntas de entrada**
- Fuente del diseño: enlace de Figma, invitación en papel o moodboard. Guarda las referencias en `.claude/skills/wedding-design/references/`.
- ¿El diseño existe en versión móvil? Si solo existe en escritorio, propón cómo se adapta.
- Paleta y tipografías ya decididas, si las hay. Tono del copy. Modo oscuro.
- Secciones públicas además del RSVP: horario, ubicación, alojamiento, transporte, historia, FAQ.
- Fotos e imagen para la previsualización de WhatsApp.
- Billete: revisa con el usuario la tabla de correspondencias de `references/concepto-billete.md` y el momento del talón que se arranca.

**Tareas**
1. Completa la skill `wedding-design` (`SKILL.md` + `tokens.json`) siguiendo su proceso. El plan incluye wireframes a 360px de la tarjeta de embarque vertical. **No apliques nada sin la aprobación del plan.**
2. Implementa la base del sistema de diseño: tokens como variables CSS, tipografías optimizadas y componentes base (campo del billete, botón, línea perforada, talón).
3. Construye las secciones públicas con contenido real del brief.
4. Diseña la imagen Open Graph como tarjeta de embarque (1200×630, JPG ligero).
5. Haz capturas a 360, 390, 430, 768 y 1280px, revísalas contra `docs/mobile-checklist.md` e itera.

**Terminado cuando**: el usuario aprueba visualmente las secciones públicas y los componentes del billete en móvil y escritorio, y la skill está COMPLETADA.

---

## [ ] Fase 4 — Formulario billete y confirmación

**Preguntas de entrada**
- Qué campos del billete son editables y cuáles decorativos (sale de la Fase 3).
- Pantalla de confirmación (el talón emitido): resumen, QR del enlace personal y acciones (calendario, cómo llegar, reenviar al acompañante).
- Texto del aviso a los novios. Se ve en el log con el notifier `console`; en producción será el email.

**Tareas**
- Página de RSVP (`/r/[token]` o `/`) como tarjeta de embarque, con el diseño aplicado y el checklist móvil completo: tipos de input, `autocomplete`, 16px, objetivos táctiles y comportamiento del teclado.
- Validación en cliente con el mismo esquema Zod, errores junto al campo y scroll al primer error.
- Envío al endpoint. Con modo invitación, edición volviendo al mismo enlace; la identificación va solo en la URL.
- Animación del talón con alternativa para `prefers-reduced-motion`.
- `.ics` con `TZID=Europe/Bucharest`, enlace a Google Calendar y enlace a mapas.
- Metadatos OG con `useSeoMeta`, comprobados con `curl`.
- Estados de error: token inválido, plazo cerrado y error de red, en el tono del diseño.

**Revisión**: `e2e-tester` en modo recorrido (360, 390 y 1280px). Prueba en un móvil real con `dev:mobile`.

**Terminado cuando**: el flujo completo funciona con los datos de seed en móvil y escritorio, el aviso aparece en el log y el usuario aprueba la experiencia.

---

## [ ] Fase 5 — Panel de los novios y WhatsApp

**Preguntas de entrada**
- Métricas y columnas del CSV.
- Formato de la lista de invitados para importar.
- Plantillas de mensaje (ver `docs/whatsapp.md`).

**Tareas**
- `/admin` protegido por el adaptador `auth`. En desarrollo, `dev` da acceso directo; la UI de login (magic link) se construye ya, aunque funcione de verdad en la Fase 8.
- Listado móvil como lista apilada, con búsqueda y filtros (incluido "Pendientes"), contadores y exportación CSV con neutralización de fórmulas.
- Modo invitación:
  - importación CSV y generación de enlaces;
  - botones "Enviar por WhatsApp", "Compartir" y "Copiar enlace";
  - plantillas editables con variables;
  - recordatorios a pendientes y registro de envíos.
- Diseño del panel sobrio, derivado de los tokens.

**Revisión**: `security-reviewer`, centrado en que los datos del panel solo salen por endpoints protegidos por el adaptador `auth`, en la codificación de `wa.me` y en que los teléfonos no aparecen en respuestas públicas.

**Terminado cuando**: el usuario gestiona invitaciones, filtra, exporta y abre WhatsApp con el mensaje correcto desde su móvil (`dev:mobile`).

---

## [ ] Fase 6 — Calidad frontend

**Preguntas de entrada**
- ¿`noindex`? Recomendado.
- Responsable de los datos para el aviso de privacidad.

**Tareas**
- `e2e-tester` completo, contra los adaptadores locales y con `reset` + `seed` antes de cada ejecución. Proyectos Android 360, iPhone y escritorio.
- Comprobaciones móviles automáticas: sin scroll horizontal, inputs a 16px o más, objetivos táctiles a 44px o más.
- Lighthouse en modo móvil con los objetivos del checklist.
- Revisión de accesibilidad.
- Aviso de privacidad (borrador para que lo revise el usuario, no asesoramiento legal).
- Revisa `docs/produccion.md` y `docs/devops-preguntas.md` para que estén completos y listos para la Fase 7.

**Terminado cuando**: e2e en verde en todos los proyectos, Lighthouse móvil dentro de objetivos y el usuario valida. La web está terminada salvo la infraestructura.

---

# Bloque B — Puesta en producción (con devops)

## [ ] Fase 7 — Traspaso a devops

**Tareas**
- Completa `docs/produccion.md`: modelo de datos final, contrato de la API, adaptadores a implementar, variables de entorno, requisitos (rate limiting, cron anti-pausa, redirecciones de auth) y fecha límite de lanzamiento (antes del primer envío de invitaciones).
- Ejecuta `/preguntas-devops` para generar el mensaje.
- Cuando lleguen las respuestas, ejecuta `/respuestas-devops`.

**Terminado cuando**: no quedan preguntas `[ABIERTA]` que bloqueen las fases 8 y 9.

---

## [ ] Fase 8 — Backend real

> Esta fase puede llevarla devops directamente con Claude Code. En ese caso, las preguntas de infraestructura se le hacen a él.

**Tareas** (según lo decidido en `docs/devops-preguntas.md`):
- Configura el MCP de Supabase en `.mcp.json` con el acceso acordado (P07).
- Migraciones SQL derivadas de los esquemas Zod. RLS en todas las tablas: sin acceso `anon`, lectura del panel solo para emails de la allowlist y escrituras solo desde el servidor.
- Adaptador `data: supabase` con la misma interfaz. Los tests de contrato deben pasar con ambos adaptadores.
- Adaptador `auth: supabase` (magic link + allowlist) y conexión de la UI de login ya construida.
- Adaptador `notifier: gmail` (o el que se decida en P05), con `replyTo` del invitado.
- Rate limiting en el almacenamiento acordado (P04).
- Cron anti-pausa protegido con `CRON_SECRET`, si se decidió en P02.
- Turnstile solo si el brief dice formulario abierto.

**Revisión**: `security-reviewer` completo.

**Terminado cuando**: la aplicación funciona con los tres adaptadores reales en un entorno de preview y la revisión no tiene hallazgos críticos.

---

## [ ] Fase 9 — Lanzamiento

**Tareas**
- Variables de entorno de producción en el hosting. `NOTIFY_TO` con los emails de los novios.
- Borra los datos de prueba e inserta los admins y las plantillas.
- **Validación de WhatsApp en preview**, con una URL de prueba distinta de la definitiva: el usuario se envía un enlace a sí mismo y revisa título, descripción e imagen. Después hace el flujo completo dentro del navegador in-app de WhatsApp, en iOS y en Android si es posible.
- Deploy a producción. Prueba completa: RSVP de prueba → email recibido → visible en el panel → borrar la prueba.
- MCP de Supabase en solo lectura, si así se acordó.
- `security-reviewer` final: revisión del bundle de cliente en busca de secretos.
- Registra en `docs/decisions.md` el recordatorio post-boda: borrado de datos (incluidos teléfonos), revocar la contraseña de aplicación y pausar o eliminar el proyecto.

**Terminado cuando**: la validación de WhatsApp y la prueba de producción pasan, y el usuario y devops lo validan.
