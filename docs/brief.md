# Brief de la boda

> Se completa en la Fase 1. No inventes valores: lo que no se haya respondido queda como "(pendiente)". Lo que los novios aún no saben queda como "por confirmar", indicando en qué fase hace falta.

## Datos básicos
- Novios: Keko y Ro
- Fecha: sábado 31 de julio de 2027
- País: Rumanía
- Ciudad: Alba (Rumanía)
- Lugar y dirección para mapas: por confirmar. Hace falta para "Cómo llegar" y el `.ics` (Fase 4); hasta entonces se usa un valor de ejemplo en los fixtures.
- Horarios (hora local de Rumanía, `Europe/Bucharest`): por confirmar. Hacen falta para la sección de horario (Fase 3) y el `.ics` (Fase 4).
- Fecha límite de confirmación: sábado 1 de mayo de 2027 (23:59, hora de Rumanía). Hasta esa fecha se puede responder y editar. Después, el formulario muestra "plazo cerrado".
- Idiomas: español y rumano (`@nuxtjs/i18n` desde la Fase 2). Cada invitación tiene un idioma preferido (ES/RO), que se usa en la web y en el mensaje de WhatsApp. El invitado puede cambiar de idioma en la web.

## Logística de viaje
- ¿De dónde viajan los invitados?: de España y de Rumanía (por eso la web es bilingüe).
- Campos de logística: ninguno de momento. No se pregunta la ciudad de origen, la fecha de llegada, el traslado ni el alojamiento. El "Desde" del billete es decorativo (se resuelve en la Fase 3).

## Modelo de acceso
- Modo: invitación con enlace personal (`/r/<token>`). Los nombres van precargados, se puede editar la respuesta, no hay duplicados y no hace falta captcha. Los novios cargan la lista de invitados en el panel.

## Campos del formulario
| Campo | Obligatorio | Notas |
|---|---|---|
| Asistencia (sí / no) | Sí | Por invitación |
| Nombres de los invitados | Sí | Precargados desde la invitación y editables (por ejemplo, para corregir una tilde o un diacrítico) |
| Acompañante (sí / no) + nombre | No | Siempre permitido: un acompañante por invitación. Si se marca, el nombre es obligatorio |
| Número de niños | No (0 por defecto) | Se cuentan aparte de los adultos para el catering. Los detalles (edad, trona, menú infantil) van en el campo de catering |
| Comentarios para el catering | No | Texto libre. No se pide explícitamente información de salud (ver "Privacidad") |
| Mensaje para los novios | No | "¿Algo que quieras decirnos?" Va separado del campo de catering |
| Email del invitado | No | Sirve de `replyTo` en el aviso a los novios |
| Idioma | — | Viene de la invitación y no se pregunta en el formulario |

- Menú: único, sin elección.
- Si la respuesta es "no", solo se mantienen visibles el mensaje para los novios y el email.

## Acompañantes y niños
- Acompañante: siempre permitido, uno por invitación, además de las personas nombradas en ella.
- Niños: sí están invitados. Se pide el número de niños aparte de los adultos.

## Notificación
- Destinatarios en producción: Keko y Ro (2 cuentas). Las direcciones no se guardan en el repo: se configuran en `NOTIFY_TO` en la Fase 9.
- ¿Avisar en ediciones?: sí. Un email por cada edición, marcado como "Cambio" e indicando qué ha cambiado (por ejemplo, asistencia sí → no).

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
- Emails con acceso: Keko y Ro (2 cuentas, sin más personas). Las direcciones no se guardan en el repo: se configuran como allowlist en la Fase 9.
- Métricas:
  - asistencia: confirmados, no vienen y pendientes, en invitaciones y en personas;
  - personas que vienen: adultos y niños por separado;
  - envíos por WhatsApp: invitaciones enviadas y sin enviar, y recordatorios enviados.
- Dispositivo principal de uso: móvil y ordenador por igual. En móvil, lista apilada; en escritorio, tabla.

## Privacidad
- Responsable: por ahora no habrá aviso de privacidad (decisión de los novios). Se revisa en la Fase 6.
- Fecha de borrado de datos: 31/10/2027. Incluye teléfonos, emails y comentarios.
- Decisión sobre alergias e intolerancias: no se pide explícitamente. Hay un campo libre opcional, "Comentarios para el catering".

## Diseño
- Concepto: el formulario es un billete de avión, una tarjeta de embarque que rellena el invitado (idea de los novios). Ver `.claude/skills/wedding-design/references/concepto-billete.md`.
- Fuente: sin Figma. Las referencias se deciden en la Fase 3.
- ¿Existe versión móvil del diseño?: se decide en la Fase 3.
- Tono del copy: se decide en la Fase 3. Los borradores de WhatsApp usan un tono cercano y en clave de viaje.
- Modo oscuro: se decide en la Fase 3.
- Secciones públicas: se deciden en la Fase 3.
