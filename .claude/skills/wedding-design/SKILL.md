---
name: wedding-design
description: Sistema de diseño y tono de la web de boda — paleta, tipografía, composición, copy y lo que no se debe hacer. Úsala siempre que crees o modifiques cualquier componente, página, estilo, texto visible o email de la web, aunque el cambio parezca pequeño. Si sus tokens siguen vacíos, no inventes un diseño: indica que falta completar la Fase 3 de PLAN.md.
---

# Diseño de la web de boda

> **Estado: PLANTILLA.** Se completa en la Fase 3 a partir de las referencias del usuario. Mientras `tokens.json` tenga valores `null`, usa estilos neutros mínimos y no tomes decisiones estéticas.

## Fuente del diseño
(pendiente: enlace de Figma o archivos en `references/`)

## Dirección
Concepto fijado por los novios: **el formulario es un billete de avión**, una tarjeta de embarque vertical en móvil. Punto de partida en `references/concepto-billete.md`.
(pendiente: 2–3 frases sobre qué debe transmitir la web y qué la hace propia de esta pareja, no de cualquier boda)

## Tokens
Los valores viven en `tokens.json`, que es la única fuente. Expónlos como variables CSS en un único archivo de estilos globales y no escribas colores ni tamaños sueltos en los componentes.

## Tipografía
(pendiente: familias y roles, escala, interlineado. Una o dos familias como máximo; si son dos, claramente distintas)

## Composición
(pendiente: estructura de la home, alineación, ritmo vertical, cómo se ve el formulario en móvil)

## Copy y tono
(pendiente: tono acordado y 3–4 ejemplos reales: titular, botón de confirmar, confirmación recibida, error)
- Los botones dicen lo que hacen: "Confirmar asistencia", no "Enviar".
- Los errores explican qué pasa y cómo arreglarlo, sin disculpas genéricas.

## Qué evitar
- Estética genérica de plantilla: tarjetas idénticas con la misma sombra, etiquetas en mayúsculas sobre cada título (excepción: los rótulos propios del billete, con las condiciones de `concepto-billete.md`), una palabra destacada en cursiva dentro del titular, animaciones de entrada en cada sección.
- Clichés de boda que no vengan de las referencias del usuario: script caligráfica por defecto, dorados, acuarelas florales. Si el usuario los quiere, se usan; si no, no se presuponen.
- Más de un elemento protagonista. Elige una sola cosa memorable y deja el resto sobrio.

## Mínimos de calidad (siempre)
- Todo lo visible cumple `docs/mobile-checklist.md`. Se diseña para 360–430px y se amplía desde ahí.
- La mayoría de invitados abrirá la web desde WhatsApp, dentro del navegador in-app: la primera pantalla en móvil debe dejar claro qué es y cómo confirmar.
- Contraste AA, foco visible, objetivos táctiles de 44px o más, y respeto a `prefers-reduced-motion`.
- Imágenes optimizadas (`@nuxt/image` o equivalente) con `alt` descriptivo.
- La imagen Open Graph (1200×630) forma parte del diseño: es lo primero que verá cada invitado en el chat.

## Proceso para completar esta skill (Fase 3)
1. Estudia las referencias (Figma MCP o `references/`) y el brief.
2. Redacta un plan:
   - paleta de 4–6 colores con nombre y hex;
   - tipografías y sus roles;
   - concepto de composición con wireframes ASCII de la home y del formulario a 360px, y cómo se amplían a escritorio;
   - 3 principios propios de este diseño.
3. Revisa el plan contra las referencias. Si algo sería igual para cualquier otra boda, cámbialo y explica por qué.
4. Presenta el plan al usuario y espera su aprobación.
5. Rellena este archivo y `tokens.json`, y cambia el estado a **COMPLETADA**.
6. Aplica el diseño, haz capturas con Playwright MCP (360, 390, 430, 768 y 1280px), revísalas contra el checklist móvil, haz autocrítica e itera.
