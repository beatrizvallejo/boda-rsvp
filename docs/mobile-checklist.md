# Checklist móvil

La mayoría de invitados abrirá la web desde un enlace de WhatsApp, dentro del navegador integrado de la app (in-app browser). Por eso el diseño se hace y se valida primero en móvil. Este archivo es la referencia única de esos requisitos: lo usan `CLAUDE.md`, la skill `wedding-design` y el subagente `e2e-tester`.

## Anchos de referencia
| Ancho | Representa |
|---|---|
| 360px | Android pequeño/medio (el caso más estrecho que hay que soportar) |
| 390px | iPhone estándar |
| 430px | iPhone grande |
| 768px | Tablet |
| 1280px | Escritorio |

El diseño se construye para 360–430px y se amplía desde ahí. Nunca al revés.

## Layout
- `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">`.
- Sin scroll horizontal en ningún ancho. Se comprueba con `document.documentElement.scrollWidth <= window.innerWidth`.
- Alturas de pantalla completa con `100dvh` y `100vh` como fallback. Las barras del navegador in-app cambian de tamaño y `100vh` corta el contenido.
- Respeta `env(safe-area-inset-*)` en elementos fijos (notch, barra inferior de iOS).
- El botón principal ("Confirmar asistencia") debe ser alcanzable con el pulgar y estar visible sin buscarlo.

## Formulario
- `font-size` de 16px o más en `input`, `select` y `textarea`. Con menos, iOS hace zoom al enfocar.
- Usa `type`, `autocomplete` e `inputmode` correctos: `autocomplete="name"`, `type="email"`, `type="tel"`, `autocomplete="tel"`.
- Los campos y los botones de opción tienen objetivos táctiles de 44×44px o más.
- Los errores aparecen junto al campo, y al fallar el envío se hace scroll al primer error.
- El teclado virtual no debe tapar el campo enfocado ni el botón de enviar.
- No hay pasos que dependan de hover.

## Navegador in-app de WhatsApp
- La identificación del invitado va en la URL (token), no en `localStorage` ni en cookies, que en el webview pueden no persistir.
- Los enlaces externos (mapas, calendario) funcionan sin abrir pestañas nuevas obligatorias.
- Se prueba al menos una vez en un dispositivo real abriendo el enlace desde WhatsApp, en iOS y en Android si es posible.

## Rendimiento (en móvil y con 4G)
- Imágenes con `@nuxt/image` (o equivalente) en AVIF o WebP, con `srcset` y `sizes`. La imagen principal se precarga y el resto usa `loading="lazy"`.
- Fuentes: como mucho 2 familias, en `woff2`, con subset latino, `font-display: swap` y la principal precargada.
- Objetivo con Lighthouse en modo móvil: LCP < 2,5 s, CLS < 0,1 y JavaScript inicial mínimo. La página de RSVP no necesita librerías pesadas.

## Accesibilidad mínima
- Contraste AA, foco visible y labels reales (no solo placeholder).
- Respeta `prefers-reduced-motion`.
- Respeta el modo oscuro del sistema, o fija explícitamente un esquema de color con `color-scheme`. Se decide en la Fase 5.
