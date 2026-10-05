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

### [ABIERTA] P02 — Supabase: número de proyectos y plan
- Contexto: tráfico muy bajo y vida útil hasta agosto de 2027. El plan Free pausa los proyectos con poca actividad durante 7 días.
- Pregunta: ¿un único proyecto vale? ¿Cómo evitamos la pausa: cron diario, plan Pro durante los meses de RSVP, o ambos?
- Opciones y recomendación: un proyecto, más cron desde el lanzamiento, más Pro durante los meses de envíos y respuestas.
- Bloquea: Fase 8.
- Respuesta:

### [ABIERTA] P03 — Backups
- Contexto: las respuestas de los invitados son el único dato valioso.
- Pregunta: ¿qué estrategia de backup usamos según el plan elegido?
- Opciones y recomendación: backups del plan, si los incluye, o un `pg_dump` periódico a un almacenamiento externo.
- Bloquea: Fase 9.
- Respuesta:

### [ABIERTA] P04 — Rate limiting en serverless
- Contexto: el endpoint de RSVP necesita un límite por IP. En memoria no es fiable con varias instancias.
- Pregunta: ¿dónde guardamos los contadores? ¿Y de qué cabecera leemos la IP real del cliente tras el proxy del hosting? Hoy, en local, se usa la IP de la conexión y se ignora `X-Forwarded-For` porque se podría falsificar.
- Opciones y recomendación: una tabla en Supabase (sin servicios nuevos), un KV del proveedor de hosting, o Upstash.
- Bloquea: Fase 8.
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

### [ABIERTA] P07 — Acceso de Claude a producción
- Contexto: Claude puede usar el MCP de Supabase para crear migraciones y comprobar las reglas de acceso (RLS).
- Pregunta: ¿le das acceso al proyecto? ¿Pasamos a solo lectura tras el lanzamiento? ¿O prefieres aplicar tú las migraciones?
- Opciones y recomendación: acceso de escritura hasta el lanzamiento y solo lectura después.
- Bloquea: Fase 8.
- Respuesta:
