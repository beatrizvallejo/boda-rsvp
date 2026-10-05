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

## Variables de entorno de producción
Ver la sección de producción en `.env.example`. Se completa en la Fase 7.

## Datos personales
- Se guardan nombres, respuestas, el teléfono por invitación (opcional, lo introducen los novios) y el email del invitado (opcional).
- No se piden datos de salud: solo hay un campo libre opcional, "Comentarios para el catering". Tampoco se piden documentos de identidad.
- Borrado previsto el 31/10/2027 (ver `docs/brief.md`).
- Por ahora no hay aviso de privacidad (decisión de los novios). Se revisa en la Fase 6.
