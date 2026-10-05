# Puesta en producción

Este documento es para el compañero de devops. Describe qué necesita la web para funcionar en producción y qué decisiones se proponen por defecto. Claude lo mantiene actualizado durante el desarrollo y lo completa en la Fase 7.

> Estado: **propuesta inicial**. Nada de lo que sigue está decidido hasta que devops lo confirme en `docs/devops-preguntas.md`.

## Qué es la aplicación
- Nuxt 4 con SSR. Las rutas `server/api/*` (Nitro) hacen de backend: toda lectura y escritura de datos pasa por ahí.
- **Capa de datos detrás de adaptadores** (`server/utils/adapters/`). Hoy funciona con almacenamiento local (Nitro storage). En producción se cambia por Supabase sin tocar el frontend ni el contrato de la API.
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
| Base de datos y auth | Supabase, **un único proyecto** | Un solo entorno real; los datos de prueba se borran antes del primer envío | Proyecto separado para desarrollo |
| Pausa por inactividad (plan Free) | Cron diario en Vercel con una consulta mínima, y plan Pro durante los meses de RSVP | Supabase pausa los proyectos Free con poca actividad durante 7 días | Solo cron, o solo Pro |
| Backups | A decidir | Comprobar la retención de backups del plan elegido; valorar un `pg_dump` periódico | |
| Antispam | Sin Turnstile si el acceso es por enlace personal (el token ya lo cumple); honeypot + rate limiting | Una cuenta y una configuración menos | Turnstile, si el formulario es abierto |
| Email | Gmail SMTP con contraseña de aplicación, solo para avisar a los novios | Remitente y destinatario son la misma cuenta, sin problemas de entregabilidad | Proveedor transaccional con dominio verificado |
| Rate limiting | Almacenamiento compartido entre instancias serverless | En memoria no funciona bien en serverless | |
| Dominio | Subdominio de Vercel, salvo que los novios quieran uno propio | Hay que decidirlo antes del primer envío: WhatsApp cachea las previsualizaciones | |
| MCP de Supabase para Claude | Escritura solo hasta el lanzamiento; después, solo lectura | Evita cambios accidentales con datos reales | |

## Requisitos derivados del brief (Fase 1)
- **Acceso por enlace personal** (`/r/<token>`): se confirma la propuesta de no usar Turnstile. El antispam se basa en el token, un honeypot y rate limiting.
- **Bilingüe ES/RO** (`@nuxtjs/i18n`): cada invitación guarda su idioma. Las plantillas de WhatsApp existen en los dos idiomas (`invitation`/`reminder` × `es`/`ro`).
- **Aviso por email en cada respuesta y en cada edición.** En las ediciones se indica qué ha cambiado, así que el servidor necesita la versión anterior de la respuesta al guardar. Como `replyTo` se usa el email del invitado, si lo ha dado.
- **Destinatarios y accesos:** las 2 cuentas de los novios en `NOTIFY_TO` y en la allowlist del panel. Las direcciones no están en el repo; se configuran en la Fase 9.
- **Fecha límite de respuesta:** 01/05/2027 23:59 `Europe/Bucharest`. A partir de entonces el endpoint de RSVP rechaza respuestas y ediciones.
- **Borrado de datos:** 31/10/2027. Incluye teléfonos, emails y comentarios.

## Modelo de datos (Fase 2)
La única fuente es `shared/schemas/` (Zod). Las migraciones de la Fase 8 se derivan de ahí. Límites de longitud: deben replicarse como `check` en SQL.

**`invitations`**
| Campo | Tipo | Notas |
|---|---|---|
| `id` | uuid, PK | lo genera el servidor (`crypto.randomUUID`) |
| `token` | text, **único** | 32 bytes aleatorios en base64url (43 caracteres, 256 bits). Es el secreto del enlace `/r/<token>` |
| `label` | text ≤80 | etiqueta del grupo ("Familia Popescu") |
| `guest_names` | text[] 1–8, cada uno ≤80 | nombres precargados |
| `locale` | `es` \| `ro` | idioma de la web y del mensaje de WhatsApp |
| `phone` | text E.164, nullable | **solo panel**, nunca en respuestas públicas |
| `invited_sent_at`, `reminder_sent_at` | timestamptz, nullable | registro orientativo de envíos por WhatsApp |
| `reminder_count` | int ≥0 | |
| `created_at` | timestamptz | |

**`rsvps`** (una por invitación)
| Campo | Tipo | Notas |
|---|---|---|
| `invitation_id` | uuid, PK y FK → `invitations.id` **on delete cascade** | |
| `attending` | boolean | |
| `guest_names` | text[] 1–8, cada uno ≤80 | editables por el invitado |
| `companion_name` | text ≤80, nullable | `null` = sin acompañante |
| `children` | int 0–10 | |
| `catering_notes` | text ≤500, nullable | |
| `message_to_couple` | text ≤1000, nullable | |
| `email` | text ≤254, nullable | `replyTo` del aviso |
| `updated_by` | `guest` \| `admin` | los cambios de los novios desde el panel no generan aviso |
| `created_at`, `updated_at` | timestamptz | |

Si `attending = false`, el servidor guarda `companion_name = null`, `children = 0` y `catering_notes = null`.

**`message_templates`**: PK (`kind` `invitation`\|`reminder`, `locale` `es`\|`ro`), `body` text ≤1000 que debe contener `{enlace}`, `updated_at`. Se insertan las 4 plantillas iniciales de `server/fixtures/index.ts` (`fixtureTemplates`) en la Fase 9.

**Interfaz del adaptador:** `server/utils/adapters/data/types.ts` (`DataAdapter`). El adaptador `supabase` debe implementarla tal cual. `insertInvitations` es todo o nada, y `deleteInvitation` borra también la respuesta.

## Contrato de la API (Fase 2)
Entradas validadas con los esquemas de `shared/schemas/`. Los errores tienen la forma `{ statusCode, data: { code, issues? } }` con `code` ∈ `not_found`, `deadline_closed`, `validation`, `rate_limited`, `unauthorized`, `payload_too_large`, `length_required`, `unsupported_media_type`. Los cuerpos exigen `Content-Type: application/json` (si no, 415) y `Content-Length` (si no, 411). Cuerpo máximo: 64 KB (si no, 413). Los nombres no admiten caracteres de control ni controles bidireccionales, y los textos libres solo admiten `\n`.

| Método y ruta | Acceso | Entrada → salida |
|---|---|---|
| `GET /api/rsvp/:token` | público, rate limit 60/10 min/IP | → `{ invitation: {guestNames, locale}, rsvp \| null, deadline, closed }`. Sin `label` (etiqueta interna de los novios). Token inválido o inexistente: 404 |
| `PUT /api/rsvp/:token` | público, rate limit 20/10 min/IP | `RsvpInput` + honeypot `website` (vacío) → `{ rsvp, isNew, changes[] }`. 404, 410 (`deadline_closed`), 422, 429. Honeypot relleno: 204 sin guardar (éxito simulado) |
| `GET /api/admin/session` | auth | → `{ email }` o 401 |
| `GET /api/admin/invitations` | auth | → invitaciones con `rsvp` (incluye teléfono y token) |
| `POST /api/admin/invitations` | auth | una invitación o un array de 1–500 (importación) → 201 con las creadas |
| `PATCH /api/admin/invitations/:id` | auth | `{label?, guestNames?, locale?, phone?}` → invitación |
| `DELETE /api/admin/invitations/:id` | auth | → 204 (borra también la respuesta) |
| `PUT /api/admin/invitations/:id/rsvp` | auth | `RsvpInput` → respuesta registrada por los novios. **Ignora la fecha límite** y no genera aviso |
| `POST /api/admin/invitations/:id/sent` | auth | `{kind: invitation\|reminder}` → invitación con el envío registrado |
| `GET /api/admin/stats` | auth | → métricas (ver `statsSchema`) |
| `GET /api/admin/templates` | auth | → plantillas |
| `PUT /api/admin/templates/:kind/:locale` | auth | `{body}` → plantilla |

- **Orden en `PUT /api/rsvp/:token`:** rate limit → honeypot → Zod → token → plazo → guardado → aviso. Un fallo del aviso se registra en el log y no revierte el guardado. Reenviar una respuesta idéntica no guarda nada ni genera aviso.
- **Protección del panel:** cada handler de `/api/admin/*` llama a `requireAdmin()`. Además, el middleware `server/middleware/admin-auth.ts` cubre todo el prefijo. El adaptador `auth: supabase` implementa `getAdminSession(event)` (sesión + allowlist).
- **Rate limit (bloqueante en la Fase 8):** hoy es en memoria (`server/utils/rate-limit.ts`) y toma la IP de la conexión, sin `X-Forwarded-For`. Detrás del proxy del hosting, todos los invitados compartirían un único contador. En producción hay que:
  - leer la IP de la cabecera fiable del proveedor (P04);
  - no tratar nunca `unknown` como un contador global;
  - mover los contadores a un almacén compartido.
- **Aviso por email:** el endpoint espera (`await`) al notifier dentro de un `try/catch`. Con Gmail, pon un timeout corto al transporte de nodemailer (o usa `event.waitUntil`, si el hosting lo admite) para que un SMTP lento no retrase la respuesta al invitado.
- **CSRF:** cuando la sesión de Supabase vaya en cookie, comprobar además `Origin`/`Sec-Fetch-Site` en `/api/admin/*`. Ya se exige `Content-Type: application/json`.
- **Pendiente:** exportación CSV (`GET /api/admin/export.csv`), en la Fase 5.

## Selección de adaptadores y salvaguarda
- Variables `DATA_ADAPTER`, `AUTH_ADAPTER` y `NOTIFIER_ADAPTER`, leídas en tiempo de ejecución (`server/utils/adapters/config.ts`).
- En producción **no tienen valor por defecto**: si falta alguna, el servidor no arranca.
- Con `AUTH_ADAPTER=dev`, el servidor de producción lanza un error al arrancar (plugin `server/plugins/00.adapters.ts`). Está comprobado con `node .output/server/index.mjs`.
- El adaptador `local` guarda en `.data/db` (Nitro storage `fs`). No sirve para serverless: en producción es obligatorio `DATA_ADAPTER=supabase`.

## Variables de entorno de producción
Ver la sección de producción en `.env.example`. Se completa en la Fase 7.

## Datos personales
- Se guardan nombres, respuestas, el teléfono por invitación (opcional, lo introducen los novios) y el email del invitado (opcional).
- No se piden datos de salud: solo hay un campo libre opcional, "Comentarios para el catering". Tampoco se piden documentos de identidad.
- Borrado previsto el 31/10/2027 (ver `docs/brief.md`).
- Por ahora no hay aviso de privacidad (decisión de los novios). Se revisa en la Fase 6.
