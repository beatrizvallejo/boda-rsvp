# Puesta en producción

Este documento es para el compañero de devops. Describe qué necesita la web para funcionar en producción y qué decisiones se proponen por defecto. Claude lo mantiene actualizado durante el desarrollo y lo completa en la Fase 7.

> Estado: **propuesta inicial**. Nada de lo que sigue está decidido hasta que devops lo confirme en `docs/devops-preguntas.md`.

## Qué es la aplicación
- Nuxt 4 con SSR. Las rutas `server/api/*` (Nitro) hacen de backend: toda lectura y escritura de datos pasa por ahí.
- **Capa de datos detrás de adaptadores** (`server/utils/adapters/`). Hoy funciona con almacenamiento local (Nitro storage). En producción es **el mismo código** con un driver KV del hosting (Nitro storage/unstorage): sin base de datos SQL, migraciones ni RLS.
- Tres adaptadores:
  - `data`: invitaciones, respuestas y plantillas de mensaje;
  - `auth`: login del panel de los novios;
  - `notifier`: email a los novios con cada respuesta.
- Tráfico esperado: muy bajo (decenas o pocos cientos de invitados) y concentrado en las semanas siguientes a cada envío de invitaciones.
- Fecha de la boda: 31/07/2027. La web tiene vida útil hasta poco después; luego se borran los datos.
- **Runtime:** Nuxt 4.5 exige Node `^22.19.0 || ^24.11.0 || >=26` (fijado en `engines` y `.nvmrc`). El hosting debe usar Node 22 o 24. Gestor de paquetes: pnpm 12 (`packageManager` en `package.json`). Los builds de `esbuild` y `unrs-resolver` están aprobados en `pnpm-workspace.yaml` (`allowBuilds`).

## Propuesta por defecto

| Pieza | Propuesta | Motivo | Alternativa |
|---|---|---|---|
| Hosting | Vercel (plan Hobby) | Previews por rama (necesarias para validar la previsualización de WhatsApp), cero configuración con Nuxt | Netlify, Cloudflare Pages |
| Datos | KV del hosting o Upstash Redis (plan gratuito), vía driver de unstorage | Decenas de invitaciones: un KV sobra. Mismo código que en local, sin SQL, migraciones, RLS ni pausa por inactividad | Supabase (descartado por complejidad) |
| Login del panel | Contraseña compartida de los novios (`ADMIN_PASSWORD`) + cookie de sesión sellada (`NUXT_SESSION_PASSWORD`) | Son 2 personas; sin proveedor de auth ni allowlist | Magic link (descartado por complejidad) |
| Backups | Descarga periódica desde el panel (CSV) y, si el KV lo ofrece, su copia automática | Las respuestas son el único dato valioso | |
| Antispam | Ninguno: el acceso es por enlace personal con un código aleatorio que no se puede adivinar | Sin rate limit, honeypot ni captcha | |
| Email | Gmail SMTP con contraseña de aplicación, solo para avisar a los novios | Remitente y destinatario son la misma cuenta, sin problemas de entregabilidad | Proveedor transaccional con dominio verificado |
| Dominio | Subdominio de Vercel, salvo que los novios quieran uno propio | Hay que decidirlo antes del primer envío: WhatsApp cachea las previsualizaciones | |

## Requisitos derivados del brief (Fase 1)
- **Acceso por enlace personal** (`/r/<token>`): no hace falta captcha ni rate limit: el token es el control de acceso.
- **Bilingüe ES/RO** (`@nuxtjs/i18n`): cada invitación guarda su idioma. Las plantillas de WhatsApp existen en los dos idiomas (`invitation`/`reminder` × `es`/`ro`).
- **Aviso por email en cada respuesta y en cada edición.** En las ediciones se indica qué ha cambiado, así que el servidor necesita la versión anterior de la respuesta al guardar. Como `replyTo` se usa el email del invitado, si lo ha dado.
- **Destinatarios y accesos:** las 2 cuentas de los novios en `NOTIFY_TO`; al panel se entra con la contraseña compartida. Las direcciones no están en el repo; se configuran en la Fase 9.
- **Fecha límite de respuesta:** 01/05/2027 23:59 `Europe/Bucharest`. A partir de entonces el endpoint de RSVP rechaza respuestas y ediciones.
- **Borrado de datos:** 31/10/2027. Incluye teléfonos y emails (vaciar el KV entero basta).

## Modelo de datos (Fase 2)
La única fuente es `shared/schemas/` (Zod). Cada registro se guarda como un documento JSON en el KV y **se valida con su esquema al leerlo**: no hay SQL, migraciones ni `check`. Claves en `server/utils/adapters/data/local-keys.ts`: `invitations:<id>`, `tokens:<token>` (índice token → id), `rsvps:<invitationId>` y `templates:<kind>-<locale>`. Los nombres de campo de las tablas siguientes son los del JSON en camelCase (`guestName`, `invitedSentAt`…).

**`invitations`**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid | lo genera el servidor (`crypto.randomUUID`) |
| `token` | texto ≤64, **único** (índice `tokens:`) | Nombre del invitado en formato URL + `-` + 6 caracteres aleatorios `[a-z0-9]` de `crypto.randomInt` (p. ej. `ana-garcia-lopez-k7f3q2`). Es el secreto del enlace `/r/<token>` |
| `label` | texto ≤80, puede estar vacía | etiqueta del grupo ("Familia Ro", "Amigos Keko"); sirve para filtrar en el panel |
| `guestName` | texto ≤80 | nombre precargado: una invitación = una persona |
| `locale` | `es` \| `ro` | idioma de la web y del mensaje de WhatsApp |
| `phone` | texto E.164, nullable | **solo panel**, nunca en respuestas públicas |
| `invitedSentAt`, `reminderSentAt` | fecha ISO, nullable | registro orientativo de envíos por WhatsApp |
| `reminderCount` | entero ≥0 | |
| `createdAt` | fecha ISO | |

**`rsvps`** (una por invitación)
| Campo | Tipo | Notas |
|---|---|---|
| `invitationId` | uuid de la invitación (una respuesta por invitación) | se borra con la invitación (`deleteInvitation`) |
| `guestName` | texto ≤80 | editable por el invitado |
| `companionName` | texto ≤80, nullable | `null` = sin acompañante |
| `children` | entero 0–10 | |
| `email` | texto ≤254, nullable | `replyTo` del aviso |
| `updatedBy` | `guest` \| `admin` | los cambios de los novios desde el panel no generan aviso |
| `createdAt`, `updatedAt` | fecha ISO | |

Solo existen confirmaciones: una invitación sin documento en `rsvps:` está pendiente. No hay respuesta "no".

**`templates`**: clave (`kind` `invitation`\|`reminder`, `locale` `es`\|`ro`), `body` texto ≤1000 que debe contener `{enlace}`, `updatedAt`. Se insertan las 4 plantillas iniciales de `server/fixtures/index.ts` (`fixtureTemplates`) en la Fase 9.

**Interfaz del adaptador:** `server/utils/adapters/data/types.ts` (`DataAdapter`). El adaptador `kv` reutiliza la implementación de `local`. `insertInvitations` comprueba duplicados antes de escribir (no es transaccional; suficiente para este volumen), y `deleteInvitation` borra también la respuesta.

## Contrato de la API (Fase 2)
Entradas validadas con los esquemas de `shared/schemas/`. Los errores tienen la forma `{ statusCode, data: { code, issues? } }` con `code` ∈ `not_found`, `deadline_closed`, `validation`, `unauthorized`. Las longitudes máximas de cada campo las fijan los esquemas; un JSON mal formado da 400.

| Método y ruta | Acceso | Entrada → salida |
|---|---|---|
| `GET /api/rsvp/:token` | público | → `{ invitation: {guestName, locale}, rsvp \| null, deadline, closed }`. Sin `label` (etiqueta interna de los novios). Token inválido o inexistente: 404 |
| `PUT /api/rsvp/:token` | público | `RsvpInput` → `{ rsvp, isNew, changes[] }`. 404, 410 (`deadline_closed`), 422 |
| `POST /api/auth/login` | público | `{password}` → 204 y cookie de sesión, o 401 |
| `POST /api/auth/logout` | público | → 204 (borra la sesión) |
| `GET /api/admin/session` | auth | → `{ method: dev\|password }` o 401 |
| `GET /api/admin/invitations` | auth | → invitaciones con `rsvp` (incluye teléfono y token) |
| `POST /api/admin/invitations` | auth | una invitación o un array de 1–500 (importación) → 201 con las creadas |
| `PATCH /api/admin/invitations/:id` | auth | `{label?, guestName?, locale?, phone?}` → invitación |
| `DELETE /api/admin/invitations/:id` | auth | → 204 (borra también la respuesta) |
| `DELETE /api/admin/invitations/:id/rsvp` | auth | → 204: quita la confirmación (vuelve a pendiente), sin aviso |
| `PUT /api/admin/invitations/:id/rsvp` | auth | `RsvpInput` → respuesta registrada por los novios. **Ignora la fecha límite** y no genera aviso |
| `POST /api/admin/invitations/:id/sent` | auth | `{kind: invitation\|reminder}` → invitación con el envío registrado |
| `GET /api/admin/stats` | auth | → métricas (ver `statsSchema`) |
| `GET /api/admin/templates` | auth | → plantillas |
| `PUT /api/admin/templates/:kind/:locale` | auth | `{body}` → plantilla |
| `GET /api/admin/export.csv` | auth | → CSV (`;`, UTF-8 con BOM), una fila por invitación, con fórmulas neutralizadas (prefijo `'`; por eso los teléfonos salen como `'+34…`) |

- **Orden en `PUT /api/rsvp/:token`:** Zod → token → plazo → guardado → aviso. Un fallo del aviso se registra en el log y no revierte el guardado. Reenviar una respuesta idéntica no guarda nada ni genera aviso.
- **Protección del panel:** cada handler de `/api/admin/*` llama a `requireAdmin()`. Además, el middleware `server/middleware/admin-auth.ts` cubre todo el prefijo. Todo `/api/admin/**` lleva `Cache-Control: private, no-store` (`routeRules`).
- **Aviso por email:** el endpoint espera (`await`) al notifier dentro de un `try/catch`. Con Gmail, pon un timeout corto al transporte de nodemailer (o usa `event.waitUntil`, si el hosting lo admite) para que un SMTP lento no retrase la respuesta al invitado.
- **CSRF:** la cookie de sesión del panel va con `SameSite=Lax`, así que el navegador no la envía en peticiones `POST`/`PUT`/`PATCH`/`DELETE` desde otros sitios.

## Selección de adaptadores y salvaguarda
- Variables `DATA_ADAPTER`, `AUTH_ADAPTER` y `NOTIFIER_ADAPTER`, leídas en tiempo de ejecución (`server/utils/adapters/config.ts`).
- En producción **no tienen valor por defecto**: si falta alguna, el servidor no arranca.
- Con `AUTH_ADAPTER=dev`, el servidor de producción lanza un error al arrancar (plugin `server/plugins/00.adapters.ts`). Está comprobado con `node .output/server/index.mjs`.
- El adaptador `local` guarda en `.data/db` (Nitro storage `fs`). No sirve para serverless: en producción es obligatorio `DATA_ADAPTER=kv`.

## Buscadores
- Toda la web lleva `X-Robots-Tag: noindex, nofollow` (`routeRules` en `nuxt.config.ts`) y la meta `robots` equivalente. `robots.txt` deja rastrear **a propósito**: un `Disallow` impediría a los buscadores leer el `noindex` y podría bloquear al rastreador de la previsualización de WhatsApp.

## Tests (Fase 6)
- `pnpm test:e2e` (Playwright) contra `http://localhost:3000` o `PLAYWRIGHT_BASE_URL`. El `globalSetup` ejecuta `pnpm seed` (vacía `.data/` y carga los datos de ejemplo) **solo si la URL es local**: nunca toca un entorno remoto.
- El flujo completo (enlace → confirmar → editar → panel) corre en `android-360` con adaptadores locales (`AUTH_ADAPTER=dev`). En CI, `webServer` levanta `pnpm build && pnpm preview` con esos adaptadores.

## Frontend (Fase 3)
- **Rutas públicas:** `/` (portada sin enlace personal) y `/r/<token>` (tarjeta del invitado). Un token inexistente devuelve la página con aviso y **código 404**.
- **Metadatos Open Graph** renderizados en servidor (`useSeoMeta`): `og:image` apunta a `${NUXT_PUBLIC_SITE_URL}/og.jpg` (1200×630, 57 KB). La URL pública debe estar bien fijada antes del primer envío por WhatsApp (WhatsApp cachea la previsualización).
- **Estáticos en `public/`:** fuente Archivo autoalojada (`/fonts/*.woff2`, 176 KB, OFL), fotos de los novios (`/fotos/boda-1..4.jpg`, ~60 KB cada una) y `og.jpg`. Sin peticiones a terceros (ni Google Fonts).
- **Idioma:** sin prefijo en la URL; el inicial es el de la invitación y el elegido se guarda en la cookie `boda_locale`.
- **Solo confirmaciones:** no hay respuesta "no"; una invitación sin fila en `rsvps` está pendiente.

## Formulario y confirmación (Fase 4)
- **Ruta `GET /boda.ics?lang=es|ro`** (`server/routes/boda.ics.ts`, pública): evento de calendario con `TZID=Europe/Bucharest` y `VTIMEZONE`, del 31/07/2027 13:00 al 01/08/2027 03:00 (hora de Rumanía). `Content-Disposition: attachment` y `Cache-Control: public, max-age=3600`. Se sirve desde el servidor porque las descargas de blobs fallan en el navegador de WhatsApp.
- **Google Calendar:** enlace directo a `calendar.google.com` con `ctz=Europe/Bucharest`, sin API ni credenciales.
- **Aviso a los novios** (`server/utils/adapters/notifier/format.ts`): texto plano, en español. Asunto `✈️ <nombre> confirma · N adultos + N niños` (respuesta nueva) o `✏️ Cambio · <nombre>` (edición), con la lista de cambios, la respuesta completa y el enlace `${NUXT_PUBLIC_SITE_URL}/admin`. El adaptador `gmail` debe usar el mismo `formatRsvpNotification(notification, siteUrl)` y el email del invitado como `replyTo`.

## Panel de los novios (Fase 5)
- **Login (`AUTH_ADAPTER=password`, `server/utils/adapters/auth/password.ts`):** contraseña compartida `ADMIN_PASSWORD` (mínimo 16 caracteres), comparada en tiempo constante (SHA-256 + `timingSafeEqual`). Sesión sellada con `useSession` de h3 y `NUXT_SESSION_PASSWORD` (≥32 caracteres): cookie `boda_panel`, `HttpOnly`, `Secure`, `SameSite=Lax`, 30 días, sin cabecera alternativa. Si falta alguna de las dos variables, o no llega al mínimo, **el servidor no arranca**. Cambiar `NUXT_SESSION_PASSWORD` cierra todas las sesiones: es lo que hay que hacer si se pierde un móvil con el panel abierto (la sesión no se guarda en servidor, así que el logout solo borra la cookie de ese navegador).
- Sin rate limit en el login, por la decisión de sencillez: la defensa es una contraseña larga (4+ palabras al azar).
- **Rutas `/admin/**`:** solo en el cliente (`ssr: false`) y con `X-Robots-Tag: noindex, nofollow`. Los datos solo salen por `/api/admin/*`.
- **Enlaces de los mensajes:** `${NUXT_PUBLIC_SITE_URL}/r/<token>`. Solo en desarrollo se usa la URL del navegador (para probar con `dev:mobile`).
- **Exportación CSV:** también sirve de copia de seguridad manual (ver P03).

## Variables de entorno de producción
Ver la sección de producción en `.env.example`. Se completa en la Fase 7. `NUXT_PUBLIC_SITE_URL` (URL pública, sin barra final) es obligatoria: la usan los metadatos OG y `baseUrl` de i18n, y se lee al construir.

## Datos personales
- Se guardan nombres, respuestas, el teléfono por invitación (opcional, lo introducen los novios) y el email del invitado (opcional).
- No se piden datos de salud ni hay campos libres (sin comentarios ni mensajes desde la Fase 3). Tampoco se piden documentos de identidad.
- Borrado previsto el 31/10/2027 (ver `docs/brief.md`).
- Por ahora no hay aviso de privacidad (decisión de los novios). Se revisa en la Fase 6.
