---
name: wedding-design
description: Sistema de diseño y tono de la web de boda — paleta, tipografía, composición, copy y lo que no se debe hacer. Úsala siempre que crees o modifiques cualquier componente, página, estilo, texto visible o email de la web, aunque el cambio parezca pequeño.
---

# Diseño de la web de boda

> **Estado: COMPLETADA** (Fase 3, 06/10/2026). Se sigue sin excepciones. Cualquier cambio de dirección se decide con el usuario y se registra en `docs/decisions.md`.

## Fuente del diseño
Sin Figma. El diseño salió de iterar un prototipo con el usuario en la Fase 3. Referencias en `references/`:
- `concepto-billete.md`: el concepto de partida (el formulario es una tarjeta de embarque).
- `fotos/`: fotos originales de los novios. Las versiones web están en `public/fotos/` (recortes cuadrados de 600px).

## Dirección
**Señalética de aeropuerto internacional, con humor.** La boda es un vuelo (KR 3107, Allá donde estés → Alba) y el invitado embarca. Dos materiales que nunca se mezclan:
- **Paneles de fichas (split-flap) sobre negro:** informan y se mueven solos (intro, "Próximamente").
- **Tarjeta de embarque sobre papel blanco:** es lo que el invitado rellena.

Lo que la hace propia de esta pareja: los muñequitos de bloques de los novios (él calvo, ella rubia de melena larga), el vuelo desde Madrid, los dos idiomas (ES/RO) girando en las fichas y el tono de "hasta que el cuerpo aguante".

## Tokens
Los valores viven en `tokens.json` (única fuente) y se exponen como variables CSS en `app/assets/css/tokens.css`. No escribas colores ni tamaños sueltos en los componentes.
- **Amarillo señal (`signal`)**: botones principales, banda de la tarjeta, carteles de "Cómo llegar", fondo de la pantalla de éxito. En la intro, **solo** el botón Embarcar es amarillo.
- **Estados** en los paneles: verde `statusOnTime`, ámbar `statusBoarding` (parpadea).
- **Fondo de la página: arena (`page`, `#F3EBDD`)**, cálido y veraniego; la tarjeta blanca y los carteles amarillos destacan sobre él.
- **Fondo negro de los paneles** con luz cenital (degradado radial blanco al 11 % arriba) y viñeta: nunca negro plano.

## Tipografía
**Archivo** (variable, ejes `wdth` 62–125 y `wght` 400–800), autoalojada, con `latin-ext` para ș ț ă î â.
- Rótulos (VUELO, PUERTA…): `font-stretch: 75%`, 700, mayúsculas, 12px, `letter-spacing: 0.04–0.06em`.
- Texto e inputs: 100%, 400; inputs a 17px (nunca menos de 16px).
- Nombres "Keko y Ro" y títulos grandes: 112%, 800.
- Fichas (`FlapText`): 85%, 700; tamaño en `em` según el contenedor.
- **Nunca "&"**: se escribe "Keko y Ro" ("Keko și Ro" en rumano).
- **Logo de aerolínea KR** (`AirlineLogo`, `public/favicon.svg`): insignia negra, "KR" blanco en cursiva ancha (trazos, no texto) y estela amarilla de despegue. Se usa en la cabecera, en la banda de la tarjeta, en el talón (escritorio, con "Keko y Ro · Líneas aéreas"), en la tarjeta emitida y como favicon.

## Composición
**Intro** (`IntroBoard`, una vez por visita, a pantalla completa, no se cierra sola):
barra LLEGADAS · Sosiri · Arrivals con relojes Madrid/Alba → muñequitos (encima del nombre en móvil; en escritorio, absolutos a la izquierda de la K) → KEKO Y RO en fichas → "Despegue en" D·H·M → fecha · 13:00 · Alba → fila del vuelo KR3107 MADRID → ALBA con estado ES/RO/EN → seguimiento MADRID ✈ - - - ALBA ("En ruta · N % del trayecto") → botón EMBARCAR → megafonía con la fecha límite. Al pulsar: las fichas se apagan en cascada desde el botón y el panel sube.

**Página** (`/r/<token>`), de arriba abajo: cabecera (KR · Keko y Ro · ES/RO) → tarjeta de embarque, con ruta "Allá donde estés → Nuestra boda" (vertical en móvil; apaisada con talón a la derecha en escritorio) → flecha "Vuelos y alojamiento ↓" (en móvil, además, píldora flotante hasta el primer scroll) → Cómo llegar (3 carteles amarillos: Lugar → mapa, Instagram, Apertura/Cierre) → Próximamente (tarjeta negra con PRÓXIMAMENTE en fichas ámbar) → fotos de los novios sin título (tira de fotomatón en B/N; horizontal en escritorio, vertical en móvil).

**Éxito** (tras confirmar): pantalla completa amarilla → "¡Has confirmado tu asistencia!" → muñequitos saludando con borde blanco de pegatina → tarjeta emitida con sello rojo CONFIRMADO que cae con golpe. Se cierra tocando cualquier parte. **No hay respuesta "no"** ni pantalla para ella.

**Tarjeta de embarque**: banda amarilla (KR Keko y Ro · Tarjeta de embarque) → ruta Allá donde estés ✈ Alba → datos (Vuelo, Fecha, Embarque 13:00, Puerta Roots, Asiento Libre, Clase Invitado) → campos (Pasajero precargado, ¿Vienes acompañado/a? con selector segmentado, Acompañante si procede, Menores a bordo con contador) → email plegado ("+ Añadir mi email (opcional)") → microtexto → perforación con muescas → talón (logo, vuelo, asiento, pasajeros, código de barras de rayas, botón Confirmar asistencia). Nada más en el formulario: sin comentarios ni mensajes, que rompen la estética de la tarjeta. Esquinas de 20px, sombra en capas, sin borde negro.

## Tres principios
1. **El panel informa, el billete se rellena.** Nada editable en lo oscuro; nada que gire en lo blanco.
2. **Un movimiento con sentido a la vez.** Las fichas giran para contar algo (cambio de idioma, cuenta atrás); no hay animaciones decorativas de entrada en cada sección.
3. **Señalética = claridad.** Rótulos cortos, flechas que llevan a algún sitio, datos reales (13:00, Roots, 1 de mayo) en lugar de adornos.

## Copy y tono
Cercano, con guiños de viaje y humor; emojis puntuales (🪩 ✈️ 🏨 🚌). Ejemplos aprobados:
- Botón: "Confirmar asistencia". Intro: "Embarcar →".
- Éxito: "¡Has confirmado tu asistencia!" · "Nos vemos en Alba el 31 de julio."
- Horario: "Apertura 13:00 · Cierre: Hasta que el cuerpo aguante 🕺".
- Próximamente: "Muy pronto os daremos más información sobre la gestión de los vuelos y el alojamiento para quien lo necesite."
- Error de campo: "Falta el nombre de tu acompañante. Escríbelo o elige «Viajo solo/a»."
- Enlace inválido: "Este enlace no corresponde a ninguna tarjeta de embarque. Revisa el mensaje que te enviamos."
- Plazo cerrado: "El embarque se cerró el 1 de mayo. Si necesitas cambiar algo, escríbenos."
- Los botones dicen lo que hacen. Los errores explican qué pasa y cómo arreglarlo.
- Lo decorativo puede ser bilingüe (Salidas/Plecări, Embarque/Îmbarcare); el contenido va en el idioma del invitado. El rumano está pendiente de revisión nativa.

## Qué evitar
- Botones o textos de relleno sin función (se quitó "Ver mi tarjeta" y la ✕ del éxito).
- Letras gigantes que compitan con el panel; el protagonista de la intro es el panel, no el titular.
- Más amarillo en la intro que el del botón.
- Clichés de boda (caligrafía, dorados, acuarelas florales) y logos o colores de aerolíneas reales.
- El carácter "&".
- Pedir documentos o datos de vuelos reales.

## Mínimos de calidad
- `docs/mobile-checklist.md` en lo básico: sin scroll horizontal, inputs ≥16px, objetivos táctiles ≥44px, legible a 360px. Se diseña desde 360px.
- La accesibilidad avanzada no es prioritaria (web familiar, decisión del usuario): no hacen falta botones de pausa ni alternativas sin movimiento.
- Imágenes optimizadas con `alt` descriptivo.
- La imagen Open Graph (1200×630) sigue el panel de la intro: es lo primero que se ve en WhatsApp.

## Componentes
- `FlapText`: texto en fichas; solo gira lo que cambia; `spins` controla las vueltas.
- `IntroBoard`: la intro completa.
- `BrickCouple`: los novios de bloques; `wave` para saludar.
- `AirlineLogo`: el logo KR.
- Resto (tarjeta, carteles, próximamente, fotomatón, éxito): ver `app/components/`.
