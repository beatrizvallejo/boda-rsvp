# Preguntas para devops

Cola de preguntas de infraestructura. Claude añade aquí lo que necesita saber de producción en lugar de preguntárselo a la persona de frontend. El desarrollo sigue con los adaptadores locales mientras tanto.

- `/preguntas-devops` genera un mensaje listo para enviar con todas las preguntas abiertas.
- `/respuestas-devops` registra las respuestas y cierra las preguntas.

Formato de cada pregunta:

```
### [ABIERTA|RESPONDIDA] Pxx — título
- Contexto:
- Pregunta:
- Opciones y recomendación:
- Bloquea: (fase o tarea; "nada" si no bloquea)
- Respuesta: (la rellena /respuestas-devops)
```

---

### [ABIERTA] P01 — Hosting
- Contexto: Nuxt 4 SSR. Hacen falta URLs de preview por rama para validar la previsualización de WhatsApp antes del lanzamiento.
- Pregunta: ¿Vercel te parece bien, o preferís otro proveedor?
- Opciones y recomendación: Vercel Hobby (recomendado), Netlify o Cloudflare Pages.
- Bloquea: Fase 9.
- Respuesta:

### [ABIERTA] P02 — Almacén de datos (KV) en lugar de Supabase
- Contexto: el 05/10/2026 se decidió simplificar: sin Supabase. Los datos (decenas de invitaciones y respuestas) se guardan con Nitro storage, el mismo código que en local, cambiando solo el driver. El panel usa una contraseña compartida y cookie de sesión, sin proveedor de auth.
- Pregunta: ¿te parece bien? ¿Qué KV usamos?
- Opciones y recomendación: el KV del hosting elegido en P01 o Upstash Redis (gratuito, con driver oficial de unstorage). Recomendado: Upstash si el hosting es Vercel.
- Bloquea: Fase 8.
- Respuesta:
### [ABIERTA] P03 — Backups
- Contexto: las respuestas de los invitados son el único dato valioso. El panel tendrá exportación CSV.
- Pregunta: ¿basta con la copia automática del KV (si la tiene) más descargas periódicas del CSV, o prefieres algo automatizado?
- Opciones y recomendación: copia del proveedor + CSV manual semanal durante los meses de respuestas.
- Bloquea: Fase 9.
- Respuesta:

### [ABIERTA] P05 — Email de aviso a los novios
- Contexto: un único email por respuesta, solo a los novios.
- Pregunta: ¿Gmail SMTP con contraseña de aplicación te parece aceptable, o prefieres un proveedor transaccional con dominio verificado?
- Opciones y recomendación: Gmail SMTP (recomendado por simplicidad).
- Bloquea: Fase 8.
- Respuesta:

### [ABIERTA] P06 — Dominio y DNS
- Contexto: el dominio debe estar decidido antes del primer envío por WhatsApp.
- Pregunta: ¿subdominio del hosting o dominio propio? Si es propio, ¿quién lo gestiona?
- Opciones y recomendación: depende de los novios. Técnicamente, cualquiera de las dos vale.
- Bloquea: Fase 9.
- Respuesta:

> P04 (rate limiting) y P07 (acceso de Claude a Supabase) se retiraron el 05/10/2026 al simplificar la arquitectura: ya no hay rate limit ni Supabase.
