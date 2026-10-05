# boda-rsvp

Repo preparado para que Claude Code construya, fase a fase, la web de una boda (31/07/2027, Rumanía) con:
- confirmación de asistencia en forma de **billete de avión**;
- panel privado para los novios;
- aviso por email con cada respuesta;
- envío de invitaciones por WhatsApp.

Está pensada primero para móvil.

El repo no trae la aplicación hecha. Trae el plan, el contexto y la configuración para que Claude Code la construya contigo y te pregunte lo que necesite antes de cada paso.

## Dos bloques

- **A. Frontend y diseño (fases 0–6).** Todo en local, sin cuentas externas. Los datos se guardan en `.data/`, el panel funciona sin login en desarrollo y el email de aviso se imprime en el log. Al acabar este bloque, la web está terminada salvo la infraestructura.
- **B. Puesta en producción (fases 7–9).** Base de datos real, login, email, hosting y dominio, con el compañero de devops. Lo que se cambia son las implementaciones de tres adaptadores; el frontend y el contrato de la API no cambian.

Las preguntas de infraestructura que le surjan a Claude durante el bloque A no te las hace a ti: las apunta en `docs/devops-preguntas.md` y sigue trabajando.
- `/preguntas-devops` genera un mensaje listo para mandar a tu compañero.
- `/respuestas-devops` registra lo que conteste.

## Requisitos (bloque A)

- Claude Code.
- Node.js 22 (`.nvmrc`; `nvm use`) y pnpm 12 vía corepack (`corepack enable pnpm`).
- En Windows, WSL (el hook de formateo es bash).

## Cómo empezar

```bash
unzip boda-rsvp.zip && cd boda-rsvp
chmod +x .claude/hooks/format.sh
git init && git add . && git commit -m "scaffold inicial"
claude
```

Dentro de Claude Code:
1. Aprueba el servidor MCP del proyecto (Playwright).
2. Ejecuta `/siguiente`. Claude lee `PLAN.md`, detecta la primera fase pendiente, te hace las preguntas de entrada y te propone un plan antes de tocar código.
3. Cuando Nuxt esté generado, abre una segunda terminal con `pnpm dev` y déjala abierta.
4. Entre fases: revisa el diff, valida el checkpoint, haz `/clear` y vuelve a ejecutar `/siguiente`. `/estado` te dice dónde estáis.

Para probar en tu móvil: `pnpm dev:mobile` y abre `http://<IP-de-tu-ordenador>:3000` desde la misma wifi.

## Qué hay en el repo

| Ruta | Para qué |
|---|---|
| `CLAUDE.md` | Contexto permanente: arquitectura, reglas, forma de trabajar |
| `PLAN.md` | Fases con preguntas de entrada, tareas y criterio de terminado |
| `docs/brief.md` | Requisitos de la boda. Se completa en la Fase 1 |
| `docs/decisions.md` | Registro de decisiones |
| `docs/mobile-checklist.md` | Requisitos móviles |
| `docs/whatsapp.md` | Funcionalidad de WhatsApp |
| `docs/produccion.md` | Documento para devops: qué necesita la web en producción |
| `docs/devops-preguntas.md` | Cola de preguntas de infraestructura |
| `.claude/commands/` | `/siguiente`, `/estado`, `/preguntas-devops`, `/respuestas-devops` |
| `.claude/agents/` | `security-reviewer` y `e2e-tester` |
| `.claude/skills/wedding-design/` | Skill de diseño y concepto del billete. Se completa en la Fase 3 |
| `.claude/hooks/format.sh` | Formatea con Prettier/ESLint cada archivo que Claude edita |
| `.claude/settings.json` | Hooks y permisos (Claude no puede leer ni editar `.env`) |

## Para el compañero de devops

Empieza por `docs/produccion.md` y `docs/devops-preguntas.md`. Puede llevar las fases 8 y 9 directamente con Claude Code en este repo: basta con decirle que es él quien trabaja y le preguntará a él lo que necesite.
