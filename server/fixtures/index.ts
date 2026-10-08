// Datos inventados para desarrollo y tests e2e. Se cargan con `pnpm seed` (adaptador `local`).
// Nunca se usan en producción. Los tokens son fijos para poder probar con curl: nombre + `demoNN`
// (http://localhost:3000/r/ana-garcia-lopez-demo01). Una invitación = una persona (+ acompañante opcional en la respuesta).
import type { Invitation, MessageTemplate, Rsvp } from '../../shared/schemas'
import { slugifyName } from '../../shared/schemas/common'

/** Token de fixture: mismo formato que uno real, con un código fijo `demoNN` en lugar del aleatorio. */
export function fixtureToken(guestName: string, n: number): string {
  return `${slugifyName(guestName)}-demo${String(n).padStart(2, '0')}`
}

function id(n: number): string {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

interface FixtureInvitation {
  invitation: Omit<Invitation, 'id' | 'token' | 'reminderCount'> &
    Partial<Pick<Invitation, 'reminderCount'>>
  rsvp?: Omit<Rsvp, 'invitationId' | 'createdAt' | 'updatedAt' | 'updatedBy' | 'jointFlight'> &
    Partial<Pick<Rsvp, 'createdAt' | 'updatedAt' | 'updatedBy' | 'jointFlight'>>
}

const CREATED = '2026-09-20T18:00:00.000Z'
const SENT = '2026-11-02T19:30:00.000Z'

const fixtures: (FixtureInvitation & { slug: string })[] = [
  {
    slug: 'garcia-lopez',
    invitation: {
      label: 'Familia Keko',
      guestName: 'Ana García López',
      locale: 'es',
      phone: '+34600111222',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      guestName: 'Ana García López',
      companionName: 'Luis García Martín',
      children: 2,
      email: 'ana.garcia@example.com',
      jointFlight: 'yes',
      createdAt: '2026-11-03T08:12:00.000Z',
      updatedAt: '2026-11-03T08:12:00.000Z',
    },
  },
  {
    slug: 'popescu',
    invitation: {
      label: 'Familia Ro',
      guestName: 'Ioana Popescu',
      locale: 'ro',
      phone: '+40722111333',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      guestName: 'Ioana Popescu',
      companionName: 'Andrei Popescu',
      children: 0,
      email: null,
    },
  },
  {
    slug: 'taranu',
    invitation: {
      label: 'Amigos Ro',
      guestName: 'Ștefan Țăranu',
      locale: 'ro',
      phone: '+40733444555',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      guestName: 'Ștefan Țăranu',
      companionName: 'Mădălina Ionescu',
      children: 0,
      email: 'stefan.taranu@example.ro',
    },
  },
  {
    slug: 'abuela-carmen',
    invitation: {
      label: 'Familia Keko',
      guestName: 'Carmen Fernández Ruiz',
      locale: 'es',
      phone: null,
      invitedSentAt: null,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    // Respuesta registrada por los novios desde el panel (confirmó por teléfono).
    rsvp: {
      guestName: 'Carmen Fernández Ruiz',
      companionName: null,
      children: 0,
      email: null,
      updatedBy: 'admin',
    },
  },
  {
    slug: 'nombre-largo',
    invitation: {
      label: 'Familia Keko',
      guestName: 'María de los Ángeles Fernández-Villaverde de la Cruz y Montenegro',
      locale: 'es',
      phone: '+34611222333',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      guestName: 'María de los Ángeles Fernández-Villaverde de la Cruz y Montenegro',
      companionName: 'Francisco Javier Rodríguez-Monteagudo Sánchez de Albornoz',
      children: 0,
      email: 'mangeles.fv@example.com',
    },
  },
  {
    slug: 'dumitrescu',
    invitation: {
      label: 'Familia Ro',
      guestName: 'Alexandru Dumitrescu',
      locale: 'ro',
      phone: '+40744555666',
      invitedSentAt: SENT,
      reminderSentAt: '2027-03-15T17:00:00.000Z',
      reminderCount: 1,
      createdAt: CREATED,
    },
  },
  {
    slug: 'pablo-martinez',
    invitation: {
      label: 'Amigos Keko',
      guestName: 'Pablo Martínez Gil',
      locale: 'es',
      phone: '+34622333444',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
  },
  {
    slug: 'mihailescu',
    invitation: {
      label: 'Amigos Ro',
      guestName: 'Răzvan Mihăilescu',
      locale: 'ro',
      phone: '+40755666777',
      invitedSentAt: SENT,
      reminderSentAt: '2027-04-10T16:00:00.000Z',
      reminderCount: 2,
      createdAt: CREATED,
    },
  },
  {
    slug: 'lucia-sanchez',
    invitation: {
      label: 'Amigos Keko',
      guestName: 'Lucía Sánchez Moreno',
      locale: 'es',
      phone: '+34633444555',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
  },
  {
    slug: 'brancoveanu',
    invitation: {
      label: 'Familia Ro',
      guestName: 'Ileana Ionescu-Brâncoveanu',
      locale: 'ro',
      phone: null,
      invitedSentAt: null,
      reminderSentAt: null,
      createdAt: CREATED,
    },
  },
  {
    slug: 'javier-marta',
    invitation: {
      label: 'Amigos Keko',
      guestName: 'Javier Ruiz Peña',
      locale: 'es',
      phone: null,
      invitedSentAt: null,
      reminderSentAt: null,
      createdAt: CREATED,
    },
  },
  {
    slug: 'stoica',
    invitation: {
      label: 'Amigos Ro',
      guestName: 'Ana-Maria Stoica',
      locale: 'ro',
      phone: '+40766777888',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    // Respuesta editada después de la primera confirmación.
    rsvp: {
      guestName: 'Ana-Maria Stoica',
      companionName: 'Vlad Munteanu',
      children: 0,
      email: 'anamaria.stoica@example.ro',
      createdAt: '2026-11-05T10:00:00.000Z',
      updatedAt: '2026-12-01T21:45:00.000Z',
    },
  },
  {
    slug: 'trabajo',
    invitation: {
      label: 'Trabajo',
      guestName: 'Elena Navarro',
      locale: 'es',
      phone: '+34644555666',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      guestName: 'Elena Navarro',
      companionName: 'Sergio Blanco',
      children: 0,
      email: null,
      jointFlight: 'no',
    },
  },
  {
    slug: 'vladescu',
    invitation: {
      label: '',
      guestName: 'Tudor Vlădescu',
      locale: 'ro',
      phone: '+40777888999',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
  },
  {
    slug: 'etxeberria',
    invitation: {
      label: 'Amigos Keko',
      guestName: 'Nerea Etxeberria Goikoetxea',
      locale: 'es',
      phone: '+34655666777',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      guestName: 'Nerea Etxeberria Goikoetxea',
      companionName: 'Íñigo Zubizarreta Arrieta',
      children: 1,
      email: 'nerea.etxe@example.com',
      jointFlight: 'yes',
    },
  },
]

export const fixtureInvitations: Invitation[] = fixtures.map(({ invitation }, index) => ({
  reminderCount: 0,
  ...invitation,
  id: id(index + 1),
  token: fixtureToken(invitation.guestName, index + 1),
}))

export const fixtureRsvps: Rsvp[] = fixtures.flatMap(({ rsvp }, index) => {
  if (!rsvp) return []
  const createdAt = rsvp.createdAt ?? '2026-11-04T12:00:00.000Z'
  return [
    {
      jointFlight: null,
      ...rsvp,
      invitationId: id(index + 1),
      updatedBy: rsvp.updatedBy ?? 'guest',
      createdAt,
      updatedAt: rsvp.updatedAt ?? createdAt,
    },
  ]
})

// Borradores de docs/brief.md. El rumano está pendiente de revisión nativa.
const TEMPLATE_DATE = '2026-10-05T12:00:00.000Z'
export const fixtureTemplates: MessageTemplate[] = [
  {
    kind: 'invitation',
    locale: 'es',
    body: '¡Hola, {nombre}! ✈️ Tu tarjeta de embarque a Rumanía está lista: nos casamos el sábado 31 de julio de 2027 en Alba y nos encantaría que vinieras. Confírmanos antes del {fecha_limite} aquí: {enlace}\nKeko y Ro',
    updatedAt: TEMPLATE_DATE,
  },
  {
    kind: 'invitation',
    locale: 'ro',
    body: 'Bună, {nombre}! ✈️ Biletul tău de îmbarcare spre nunta noastră e gata: ne căsătorim sâmbătă, 31 iulie 2027, în Alba și ne-am bucura mult să fii alături de noi. Te rugăm să ne confirmi până pe {fecha_limite} aici: {enlace}\nKeko și Ro',
    updatedAt: TEMPLATE_DATE,
  },
  {
    kind: 'reminder',
    locale: 'es',
    body: '¡Hola, {nombre}! Última llamada para embarcar ✈️ Aún no tenemos tu respuesta para nuestra boda del 31 de julio. ¿Nos confirmas antes del {fecha_limite}? Es solo un minuto: {enlace}\nKeko y Ro',
    updatedAt: TEMPLATE_DATE,
  },
  {
    kind: 'reminder',
    locale: 'ro',
    body: 'Bună, {nombre}! Ultimul apel la îmbarcare ✈️ Încă nu avem răspunsul tău pentru nunta noastră din 31 iulie. Ne confirmi până pe {fecha_limite}? Durează doar un minut: {enlace}\nKeko și Ro',
    updatedAt: TEMPLATE_DATE,
  },
  // Aviso a los apuntados a la reserva conjunta de vuelos (Fase 6b).
  {
    kind: 'flights',
    locale: 'es',
    body: '¡Hola, {nombre}! ✈️ Novedades del vuelo conjunto Madrid → Rumanía para nuestra boda: tienes todos los detalles en tu tarjeta de embarque: {enlace}\nKeko y Ro',
    updatedAt: TEMPLATE_DATE,
  },
  {
    kind: 'flights',
    locale: 'ro',
    body: 'Bună, {nombre}! ✈️ Avem noutăți despre zborul comun Madrid → România pentru nunta noastră: găsești toate detaliile pe biletul tău de îmbarcare: {enlace}\nKeko și Ro',
    updatedAt: TEMPLATE_DATE,
  },
  // Aviso a confirmados (Fase 6d): mensaje general para una lista de difusión o un grupo, así que no
  // lleva {nombre} y {enlace} es la web pública.
  {
    kind: 'notice',
    locale: 'es',
    body: '¡Hola! 🛫 Información de embarque para nuestra boda del 31 de julio en Alba: alojamiento, traslados y horarios, todo aquí: {enlace}\nKeko y Ro',
    updatedAt: TEMPLATE_DATE,
  },
  {
    kind: 'notice',
    locale: 'ro',
    body: 'Bună! 🛫 Informații de îmbarcare pentru nunta noastră din 31 iulie, din Alba: cazare, transfer și program, totul aici: {enlace}\nKeko și Ro',
    updatedAt: TEMPLATE_DATE,
  },
]
