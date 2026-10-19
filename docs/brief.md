# Brief de la boda

> Se completa en la Fase 1. No inventes valores: lo que no se haya respondido queda como "(pendiente)". Lo que los novios aún no saben queda como "por confirmar", indicando en qué fase hace falta.

## Datos básicos
- Novios: Keko y Ro
- Fecha: sábado 31 de julio de 2027
- País: Rumanía
- Ciudad: Alba (Rumanía)
- Lugar: **Roots Wedding Venue** (Alba, Rumanía). Ceremonia y celebración en el mismo sitio.
  - Mapa: https://www.google.com/maps/place/Roots+Wedding+Venue/@46.1158452,23.4344662,15z (coordenadas 46.1158452, 23.4344662).
  - Instagram del lugar: https://www.instagram.com/roots_weddingvenue
- Horario (hora local de Rumanía, `Europe/Bucharest`): a partir de las 13:00, "y hasta que el cuerpo aguante". No hay programa por momentos (ceremonia, cóctel…): todo es en el mismo lugar. Se usa en la cuenta atrás (`WEDDING_START` en `shared/config.ts`) y en el `.ics` (Fase 4).
- Fecha límite de confirmación: lunes 1 de febrero de 2027 (23:59, hora de Rumanía). Hasta esa fecha se puede responder y editar. Después, el formulario muestra "plazo cerrado".
- Idiomas: español y rumano (`@nuxtjs/i18n` desde la Fase 2). Cada invitación tiene un idioma preferido (ES/RO), que se usa en la web y en el mensaje de WhatsApp. El invitado puede cambiar de idioma en la web.

## Logística de viaje
- ¿De dónde viajan los invitados?: de España y de Rumanía (por eso la web es bilingüe).
- Campos de logística: solo uno, opcional, desde la Fase 6b (07/10/2026): «¿Te apuntamos a la reserva conjunta desde Madrid?» (Sí / No). Va siempre visible en la tarjeta, en un cupón punteado («Reserva conjunta · Opcional»; desde el 19/10/2026), y solo aparece con la reserva conjunta en marcha. No se pregunta la ciudad de origen, la fecha de llegada, el traslado ni el alojamiento. El "Desde" del billete es decorativo.
- Vuelos (Fase 6b): los novios quieren gestionar una reserva conjunta desde Madrid cuando el precio sea bueno. Sin APIs de precios (no hay ninguna pública utilizable: Google Flights no tiene API, Skyscanner es solo para socios con 100.000 usuarios al mes y Amadeus Self-Service cerró el 17/07/2026). Sección pública editable desde el panel: estado (Próximamente / Mirando precios / Reserva abierta hasta… / Cerrada), nota ES/RO, último precio visto y enlaces de búsqueda a Google Flights, Skyscanner y Wizz Air (este desde el 19/10/2026) para MAD → Sibiu (SBZ, 70 km) y MAD → Cluj (CLJ, 100 km). Las alertas de precio las configuran los novios en Google Flights con su cuenta. Las reservas de grupo de Wizz Air empiezan en 16 pasajeros.

## Modelo de acceso
- Modo: invitación con enlace personal (`/r/<token>`). El nombre va precargado, se puede editar la respuesta, no hay duplicados y no hace falta captcha. Los novios cargan la lista de invitados en el panel.

## Campos del formulario
| Campo | Obligatorio | Notas |
|---|---|---|
| Nombre del invitado | Sí | Una invitación = una persona. Precargado y editable (por ejemplo, para corregir una tilde o un diacrítico) |
| Acompañante (sí / no) + nombre | No | Siempre permitido: un acompañante por invitación. Si se marca, el nombre es obligatorio |
| Número de niños | No (0 por defecto) | Se cuentan aparte de los adultos para el catering |
| Reserva conjunta de vuelos | No | Sí / No, en el cupón de la tarjeta. Solo con la reserva en marcha (Fase 6b) |
| Idioma | — | Viene de la invitación y no se pregunta en el formulario |

- Menú: único, sin elección.
- Solo se confirma asistencia: no hay respuesta "no". Quien no viene, no responde (decisión del 06/10/2026). Si alguien confirma y luego no puede ir, avisa a los novios y ellos quitan la confirmación desde el panel (Fase 5).

## Acompañantes y niños
- Acompañante: siempre permitido, uno por invitación (cada invitado puede llevar a una persona, lo estándar). Decisión del 06/10/2026: una invitación es para una sola persona; las parejas se invitan como invitado + acompañante.
- Niños: sí están invitados. Se pide el número de niños aparte de los adultos.

## Notificación
- Destinatarios en producción: Keko y Ro (2 cuentas). Las direcciones no se guardan en el repo: se configuran en `NOTIFY_TO` en la Fase 9.
- ¿Avisar en ediciones?: sí. Un email por cada edición, marcado como "Cambio" e indicando qué ha cambiado (por ejemplo, acompañante o niños).

## WhatsApp
- ¿Guardar teléfono por invitación?: sí, de forma opcional. Lo introducen los novios en el panel, nunca el invitado. No aparece en la parte pública y se borra con el resto de datos.
- Previsualización del enlace: genérica, igual para todos y sin nombres.
- Variables de las plantillas: `{nombre}`, `{enlace}`, `{fecha_limite}`. Los textos en rumano están pendientes de revisión por un hablante nativo y el tono se ajusta en la Fase 3.
- Mensaje de invitación (ES):
  > ¡Hola, {nombre}! ✈️ Tu tarjeta de embarque a Rumanía está lista: nos casamos el sábado 31 de julio de 2027 en Alba y nos encantaría que vinieras. Confírmanos antes del {fecha_limite} aquí: {enlace}
  > Keko y Ro
- Mensaje de invitación (RO):
  > Bună, {nombre}! ✈️ Biletul tău de îmbarcare spre nunta noastră e gata: ne căsătorim sâmbătă, 31 iulie 2027, în Alba și ne-am bucura mult să fii alături de noi. Te rugăm să ne confirmi până pe {fecha_limite} aici: {enlace}
  > Keko și Ro
- Mensaje de recordatorio (ES):
  > ¡Hola, {nombre}! Última llamada para embarcar ✈️ Aún no tenemos tu respuesta para nuestra boda del 31 de julio. ¿Nos confirmas antes del {fecha_limite}? Es solo un minuto: {enlace}
  > Keko y Ro
- Mensaje de recordatorio (RO):
  > Bună, {nombre}! Ultimul apel la îmbarcare ✈️ Încă nu avem răspunsul tău pentru nunta noastră din 31 iulie. Ne confirmi până pe {fecha_limite}? Durează doar un minut: {enlace}
  > Keko și Ro

## Panel
- Emails con acceso: Keko y Ro (2 cuentas, sin más personas). Las direcciones no se guardan en el repo: se configuran en `NOTIFY_TO` en la Fase 9. Al panel se entra con una contraseña compartida (simplificación del 05/10/2026).
- Métricas:
  - asistencia: confirmados y pendientes, en invitaciones y en personas;
  - personas que vienen: adultos y niños por separado;
  - envíos por WhatsApp: invitaciones enviadas y sin enviar, y recordatorios enviados.
- Dispositivo principal de uso: móvil y ordenador por igual. En móvil, lista apilada; en escritorio, tabla.

## Privacidad
- Responsable: por ahora no habrá aviso de privacidad (decisión de los novios). Se revisa en la Fase 6.
- Fecha de borrado de datos: 31/10/2027. Incluye teléfonos.
- Decisión sobre alergias e intolerancias: no se piden. Tampoco hay campos de comentarios ni de mensaje (decisión del 06/10/2026: el formulario se queda en nombre, acompañante y niños; el email opcional se quitó el 19/10/2026).

## Diseño
- Concepto: el formulario es un billete de avión, una tarjeta de embarque que rellena el invitado (idea de los novios). Ver `.claude/skills/wedding-design/references/concepto-billete.md`.
- Fuente: sin Figma; diseño iterado con el usuario en la Fase 3. Sistema completo en la skill `wedding-design` (señalética de aeropuerto internacional con humor, amarillo señal, Archivo, logo de aerolínea KR).
- Versión móvil: diseñada desde 360px; en escritorio la tarjeta pasa a apaisada.
- Tono del copy: cercano, con guiños de viaje y humor; emojis puntuales.
- Modo oscuro: no (solo claro; los paneles negros son parte del diseño).
- Secciones públicas: intro (panel de llegadas con cuenta atrás), tarjeta de embarque, Cómo llegar, Próximamente (vuelos, alojamiento y traslados) y fotos de los novios en tira de fotomatón. Sin programa por momentos.
