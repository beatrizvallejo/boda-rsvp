# Funcionalidad relacionada con WhatsApp

WhatsApp es el canal principal por el que se compartirá el enlace. Todo lo de aquí funciona **sin la API de WhatsApp Business**: se basa en enlaces `wa.me`, en la Web Share API y en metadatos Open Graph. La API oficial (envíos automáticos, avisos a los novios por WhatsApp) requiere verificación de empresa en Meta y queda **fuera de alcance**.

## 1. Previsualización del enlace (Open Graph) — Fases 3, 4 y 9
- Las páginas públicas sirven en el HTML renderizado en servidor `og:title`, `og:description`, `og:image` (URL absoluta), `og:url` y `og:type`. El rastreador de WhatsApp no ejecuta JavaScript, así que estos metadatos no pueden depender del cliente.
- La imagen OG es la tarjeta de embarque (ver el concepto en `references/concepto-billete.md`). Mide 1200×630, en JPG, y debe ser ligera. Se suele recomendar que no pase de unos 300 KB para que WhatsApp la muestre. Se diseña en la Fase 5.
- **Previsualización personalizada o genérica** en `/r/[token]` (se decide en la Fase 1):
  - *Genérica* (recomendada): igual para todos. No expone nombres a quien vea el chat.
  - *Personalizada*: por ejemplo "Invitación para Ana y Luis". Es más cálida, pero los nombres quedan visibles en la previsualización.
- **WhatsApp cachea las previsualizaciones.** Asume que la primera que se genere de una URL es la que verán muchos invitados. Hay que validar los metadatos en un deploy de preview **antes** de enviar el primer enlace (Fase 9).

## 2. Envío de invitaciones desde el panel — Fase 5
- Cada invitación tiene un botón **"Enviar por WhatsApp"**:
  - con teléfono guardado: `https://api.whatsapp.com/send/?phone=<telefono_internacional_sin_+>&text=<mensaje codificado>`;
  - sin teléfono: `https://api.whatsapp.com/send/?text=<mensaje codificado>`, y el novio elige el contacto.
  - **No se usa `wa.me`:** su redirección a `api.whatsapp.com` estropea algunos emojis (`✈️` llegaba como `�`, comprobado el 07/10/2026). Se enlaza directamente al destino de esa redirección.
- En móvil también hay un botón **"Compartir"** con `navigator.share` (Web Share API), y como alternativa **"Copiar enlace"**.
- Plantilla del mensaje editable desde el panel, en clave de viaje (por ejemplo, "Tu tarjeta de embarque a Rumanía está lista") y en el idioma de cada invitado si la web es multiidioma, con variables (`{nombre}`, `{enlace}`, `{fecha_limite}`). Se guarda en base de datos.
- Las variables del mensaje se codifican con `encodeURIComponent`. Nunca se construye la URL concatenando texto sin codificar.
- Se registra "enviado el …" cuando el novio pulsa el botón. Es orientativo: no hay confirmación real de entrega.

## 3. Recordatorios a pendientes — Fase 5
- El filtro "Pendientes" muestra un botón de recordatorio por invitación, con una plantilla de recordatorio propia.
- Los envíos se hacen uno a uno con `wa.me`. No hay envío masivo automático, porque sin la API oficial no es posible y además no conviene.

## 4. Lado del invitado — Fase 4
- Después de confirmar, se ofrecen:
  - **"Añadir al calendario"**, con un archivo `.ics` generado en servidor y un enlace a Google Calendar;
  - **"Cómo llegar"**, con enlace a mapas;
  - opcionalmente, **"Reenviar a mi acompañante"** con `wa.me/?text=`, si su acompañante tiene que ver la información.
- Todo debe funcionar dentro del navegador in-app de WhatsApp (ver `docs/mobile-checklist.md`).

## Datos personales
- Guardar teléfonos es opcional (se decide en la Fase 1). Sin teléfono, el flujo funciona igual: el novio elige el contacto en WhatsApp.
- Si se guardan, entran en el aviso de privacidad y en el borrado posterior a la boda, y no se muestran en la parte pública.
