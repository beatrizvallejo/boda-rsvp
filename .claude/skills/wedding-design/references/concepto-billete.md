# Concepto: el formulario es un billete de avión

Idea de los novios: el RSVP se presenta como un billete o tarjeta de embarque que el invitado rellena. Este archivo es el punto de partida para la Fase 3. Lo que aquí se propone son opciones a validar con el usuario, no decisiones tomadas.

## Formato: tarjeta de embarque vertical
- En papel, un billete es apaisado. A 360px, un billete horizontal no cabe sin encoger el texto hasta hacerlo ilegible.
- La referencia correcta es la **tarjeta de embarque móvil** de las apps de aerolíneas: vertical, con cabecera, cuerpo de datos y un talón separado por una línea perforada.
- En escritorio puede pasar a formato apaisado clásico, como ampliación del diseño móvil.

## Correspondencia billete → boda (propuestas)
| Elemento del billete | En la boda | Notas |
|---|---|---|
| Aerolínea / logo | Nombres o monograma de los novios | |
| Número de vuelo | Código simbólico (p. ej. iniciales + 3107) | Decorativo |
| Origen → destino | "Desde" (ciudad del invitado) → ciudad de la boda en Rumanía | "Desde" puede ser un campo real y útil para la logística |
| Fecha / hora de embarque | 31 JUL 2027 y hora de la ceremonia | Hora local de Rumanía |
| Puerta | Lugar de la ceremonia | |
| Pasajero 1 / pasajero 2 | Invitado / acompañante | Son los campos reales del formulario |
| Clase / menú | Elección de menú, si existe | |
| Asiento | Mesa, si más adelante se asignan mesas | Opcional, fuera del alcance inicial |
| Código de barras / QR | QR del enlace personal | Solo en la pantalla del propio invitado; el QR da acceso a editar su respuesta |
| Talón | Resumen de la confirmación | Se "arranca" al confirmar |

## Usabilidad por encima de la metáfora
- Los rótulos pequeños en mayúsculas propios de los billetes (PASSENGER, GATE) están permitidos aquí porque vienen del brief. Aun así:
  - cada campo editable tiene un `label` real y legible;
  - el valor introducido se muestra a 16px o más;
  - el rótulo tiene contraste AA aunque sea pequeño.
- Lo editable debe distinguirse claramente de lo decorativo. El invitado tiene que saber al primer vistazo qué rellenar.
- Los errores de validación siguen la metáfora solo en el tono, nunca a costa de la claridad.

## El momento memorable
- Propuesta: al confirmar, el talón se separa por la línea perforada y queda como "tarjeta emitida", con el resumen y el QR.
- Es la única animación protagonista. Con `prefers-reduced-motion`, se muestra el estado final sin la animación.

## Extensiones
- **Imagen Open Graph:** la propia tarjeta de embarque, con lo que el invitado ve en WhatsApp antes de abrir el enlace.
- **Mensaje de WhatsApp en clave de viaje.** Por ejemplo: "Tu tarjeta de embarque a Rumanía está lista".
- **Wallet de Apple o Google:** queda fuera de alcance. Los pases `.pkpass` requieren cuenta de desarrollador de Apple y certificados, y Google Wallet requiere cuenta de emisor. Si los novios lo quieren, que sea una decisión aparte.

## Qué no hacer
- No pedir datos de documentos reales (DNI, pasaporte, número de vuelo real) aunque la metáfora lo invite. No hacen falta y son datos personales innecesarios.
- No copiar la identidad visual de una aerolínea real (logos, colores corporativos reconocibles).
