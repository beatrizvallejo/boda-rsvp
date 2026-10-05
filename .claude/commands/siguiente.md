---
description: Ejecuta la siguiente fase pendiente de PLAN.md (o la indicada como argumento)
---

1. Lee `CLAUDE.md`, `PLAN.md`, `docs/brief.md` y `docs/decisions.md`.
2. Elige la fase:
   - si se ha indicado una en "$ARGUMENTS", esa;
   - si no, la primera de `PLAN.md` sin `[x]`.
   Si alguna fase anterior está sin marcar, avisa antes de seguir.
3. Di en una frase qué fase vas a ejecutar y qué vas a entregar al final.
4. Resuelve las **Preguntas de entrada**, en tandas de 3–4 como máximo y con opción recomendada. Omite las que ya estén respondidas en el brief o en las decisiones.
5. Antes de tocar archivos, presenta un plan corto de la fase (5–10 pasos) y espera confirmación.
6. Ejecuta las tareas. Si aparece una duda que cambia el resultado, para y pregunta.
7. Ejecuta las revisiones indicadas (subagentes) y corrige los hallazgos críticos.
8. Haz el checkpoint tal como se describe en `CLAUDE.md`:
   - comprueba el criterio de terminado;
   - resume;
   - pide validación;
   - y solo entonces marca la fase, registra las decisiones y haz commit.
