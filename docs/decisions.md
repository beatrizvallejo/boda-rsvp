# Registro de decisiones

Formato: `- AAAA-MM-DD · Fase N · Decisión — motivo`

<!-- Añade las entradas debajo -->
- 2026-10-05 · Fase 1 (previa) · La boda es el sábado 31/07/2027 en Rumanía — dato de los novios.
- 2026-10-05 · Fase 1 (previa) · Concepto del RSVP: billete de avión / tarjeta de embarque — idea de los novios. En móvil, formato vertical tipo tarjeta de embarque de app (ver `references/concepto-billete.md`).
- 2026-10-05 · Fase 1 (previa) · No se piden datos de documentos de identidad ni de vuelos reales aunque encajen con la metáfora — minimización de datos.
- 2026-10-05 · Organización · Desarrollo en dos bloques: frontend y diseño en local con adaptadores (fases 0–6) y puesta en producción con devops (fases 7–9). Las preguntas de infraestructura van a `docs/devops-preguntas.md` — la persona de frontend no lleva infraestructura y hay un compañero de devops.
- 2026-10-05 · Organización · Propuestas por defecto para producción (Vercel, un único proyecto de Supabase, cron anti-pausa, sin Turnstile en modo invitación), pendientes de confirmar por devops en P01–P07.
- 2026-10-05 · Fase 0 · Gestor de paquetes: pnpm 12.9.1 vía corepack, fijado en `packageManager` — recomendado y elegido por el usuario.
- 2026-10-05 · Fase 0 · Node 22 (`.nvmrc`, `engines`) — Nuxt 4.5.2 exige `^22.19 || ^24.11 || >=26`; v22.22.3 ya estaba instalado con nvm.
- 2026-10-05 · Fase 0 · TypeScript 6.0.x en lugar de 7.0 — typescript-eslint (vía @nuxt/eslint) exige `<6.1`. Revisar cuando lo soporte.
- 2026-10-05 · Fase 0 · Builds permitidos en pnpm solo para `esbuild` y `unrs-resolver` (`allowBuilds` en `pnpm-workspace.yaml`) — pnpm 12 bloquea los scripts de instalación por defecto.
- 2026-10-05 · Fase 0 · ESLint (`@nuxt/eslint`, sin reglas de estilo) + Prettier con `eslint-config-prettier` — un único responsable del formato. Los `.md` y `.claude/` quedan fuera de Prettier.
- 2026-10-05 · Fase 0 · Playwright con proyectos `android-360`, `iphone` (WebKit) y `desktop` (1280px); en local se ejecuta contra el `dev` del usuario o `PLAYWRIGHT_BASE_URL`.
- 2026-10-05 · Fase 0 · Sin Figma: eliminado de `.mcp.json` — el diseño no está en Figma; la fuente se decide en la Fase 3.
