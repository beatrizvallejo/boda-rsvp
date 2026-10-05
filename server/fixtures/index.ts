// Datos inventados para desarrollo y tests e2e. Se cargan con `pnpm seed` (adaptador `local`).
// Nunca se usan en producción. Los tokens son fijos y legibles para poder probar con curl:
// http://localhost:3000/r/<token>. Las direcciones y horarios reales están por confirmar.
import type { Invitation, MessageTemplate, Rsvp } from '../../shared/schemas'

/** Token de fixture: legible, con el formato de un token real (43 caracteres base64url). */
export function fixtureToken(slug: string): string {
  return `seed-${slug}-`.padEnd(43, '0')
}

function id(n: number): string {
  return `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`
}

interface FixtureInvitation {
  invitation: Omit<Invitation, 'id' | 'token' | 'reminderCount'> &
    Partial<Pick<Invitation, 'reminderCount'>>
  rsvp?: Omit<Rsvp, 'invitationId' | 'createdAt' | 'updatedAt' | 'updatedBy'> &
    Partial<Pick<Rsvp, 'createdAt' | 'updatedAt' | 'updatedBy'>>
}

const CREATED = '2026-09-20T18:00:00.000Z'
const SENT = '2026-11-02T19:30:00.000Z'

const NO = { companionName: null, children: 0, cateringNotes: null } as const

const fixtures: (FixtureInvitation & { slug: string })[] = [
  {
    slug: 'garcia-lopez',
    invitation: {
      label: 'Familia García López',
      guestNames: ['Ana García López', 'Luis García Martín'],
      locale: 'es',
      phone: '+34600111222',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: true,
      guestNames: ['Ana García López', 'Luis García Martín'],
      companionName: null,
      children: 2,
      cateringNotes: 'El pequeño (2 años) necesitará trona.',
      messageToCouple: '¡Qué ganas de veros! Preparando las maletas ya 🧳',
      email: 'ana.garcia@example.com',
      createdAt: '2026-11-03T08:12:00.000Z',
      updatedAt: '2026-11-03T08:12:00.000Z',
    },
  },
  {
    slug: 'popescu',
    invitation: {
      label: 'Ioana și Andrei Popescu',
      guestNames: ['Ioana Popescu', 'Andrei Popescu'],
      locale: 'ro',
      phone: '+40722111333',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: true,
      guestNames: ['Ioana Popescu', 'Andrei Popescu'],
      companionName: null,
      children: 0,
      cateringNotes: null,
      messageToCouple: 'Abia așteptăm! Casă de piatră!',
      email: null,
    },
  },
  {
    slug: 'taranu',
    invitation: {
      label: 'Ștefan Țăranu',
      guestNames: ['Ștefan Țăranu'],
      locale: 'ro',
      phone: '+40733444555',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: true,
      guestNames: ['Ștefan Țăranu'],
      companionName: 'Mădălina Ionescu',
      children: 0,
      cateringNotes: 'Mădălina este vegetariană.',
      messageToCouple: null,
      email: 'stefan.taranu@example.ro',
    },
  },
  {
    slug: 'abuela-carmen',
    invitation: {
      label: 'Abuela Carmen',
      guestNames: ['Carmen Fernández Ruiz'],
      locale: 'es',
      phone: null,
      invitedSentAt: null,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    // Respuesta registrada por los novios desde el panel (confirmó por teléfono).
    rsvp: {
      attending: true,
      guestNames: ['Carmen Fernández Ruiz'],
      companionName: null,
      children: 0,
      cateringNotes: 'Mejor poca sal, si puede ser.',
      messageToCouple: null,
      email: null,
      updatedBy: 'admin',
    },
  },
  {
    slug: 'nombre-largo',
    invitation: {
      label: 'María de los Ángeles Fernández-Villaverde',
      guestNames: ['María de los Ángeles Fernández-Villaverde de la Cruz y Montenegro'],
      locale: 'es',
      phone: '+34611222333',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: true,
      guestNames: ['María de los Ángeles Fernández-Villaverde de la Cruz y Montenegro'],
      companionName: 'Francisco Javier Rodríguez-Monteagudo Sánchez de Albornoz',
      children: 0,
      cateringNotes: null,
      messageToCouple:
        'Os escribo un mensaje largo a propósito para ver cómo se comporta el panel con textos de varias líneas. Estamos felices por vosotros, ya hemos mirado vuelos a Cluj y Sibiu, y queremos aprovechar para recorrer Transilvania unos días antes de la boda. ¡Gracias por invitarnos!',
      email: 'mangeles.fv@example.com',
    },
  },
  {
    slug: 'dumitrescu',
    invitation: {
      label: 'Familia Dumitrescu',
      guestNames: ['Alexandru Dumitrescu', 'Irina Dumitrescu', 'Bogdan Dumitrescu'],
      locale: 'ro',
      phone: '+40744555666',
      invitedSentAt: SENT,
      reminderSentAt: '2027-03-15T17:00:00.000Z',
      reminderCount: 1,
      createdAt: CREATED,
    },
    rsvp: {
      attending: false,
      guestNames: ['Alexandru Dumitrescu', 'Irina Dumitrescu', 'Bogdan Dumitrescu'],
      ...NO,
      messageToCouple: 'Ne pare foarte rău că nu putem ajunge. Vă dorim tot binele din lume!',
      email: null,
    },
  },
  {
    slug: 'pablo-martinez',
    invitation: {
      label: 'Pablo Martínez',
      guestNames: ['Pablo Martínez Gil'],
      locale: 'es',
      phone: '+34622333444',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: false,
      guestNames: ['Pablo Martínez Gil'],
      ...NO,
      messageToCouple: null,
      email: 'pablo.mg@example.com',
    },
  },
  {
    slug: 'mihailescu',
    invitation: {
      label: 'Răzvan și Cătălina',
      guestNames: ['Răzvan Mihăilescu', 'Cătălina Mihăilescu'],
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
      label: 'Lucía Sánchez',
      guestNames: ['Lucía Sánchez Moreno'],
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
      label: 'Familia Ionescu-Brâncoveanu',
      guestNames: ['Ileana Ionescu-Brâncoveanu', 'Mircea Ionescu-Brâncoveanu'],
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
      label: 'Javier y Marta',
      guestNames: ['Javier Ruiz Peña', 'Marta Iglesias Toro'],
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
      label: 'Ana-Maria Stoica',
      guestNames: ['Ana-Maria Stoica'],
      locale: 'ro',
      phone: '+40766777888',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    // Respuesta editada después de la primera confirmación.
    rsvp: {
      attending: true,
      guestNames: ['Ana-Maria Stoica'],
      companionName: 'Vlad Munteanu',
      children: 0,
      cateringNotes: null,
      messageToCouple: 'Am adăugat și însoțitorul, sper că e în regulă!',
      email: 'anamaria.stoica@example.ro',
      createdAt: '2026-11-05T10:00:00.000Z',
      updatedAt: '2026-12-01T21:45:00.000Z',
    },
  },
  {
    slug: 'trabajo',
    invitation: {
      label: 'Compañeros del trabajo',
      guestNames: ['Elena Navarro', 'Sergio Blanco', 'Raquel Ortega', 'David Molina'],
      locale: 'es',
      phone: '+34644555666',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: true,
      guestNames: ['Elena Navarro', 'Sergio Blanco', 'Raquel Ortega', 'David Molina'],
      companionName: null,
      children: 0,
      cateringNotes: null,
      messageToCouple: null,
      email: null,
    },
  },
  {
    slug: 'vladescu',
    invitation: {
      label: 'Tudor Vlădescu',
      guestNames: ['Tudor Vlădescu'],
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
      label: 'Nerea y familia',
      guestNames: ['Nerea Etxeberria Goikoetxea', 'Íñigo Zubizarreta Arrieta'],
      locale: 'es',
      phone: '+34655666777',
      invitedSentAt: SENT,
      reminderSentAt: null,
      createdAt: CREATED,
    },
    rsvp: {
      attending: true,
      guestNames: ['Nerea Etxeberria Goikoetxea', 'Íñigo Zubizarreta Arrieta'],
      companionName: null,
      children: 1,
      cateringNotes: 'Menú infantil para Ane (6 años).',
      messageToCouple: null,
      email: 'nerea.etxe@example.com',
    },
  },
]

export const fixtureInvitations: Invitation[] = fixtures.map(({ slug, invitation }, index) => ({
  reminderCount: 0,
  ...invitation,
  id: id(index + 1),
  token: fixtureToken(slug),
}))

export const fixtureRsvps: Rsvp[] = fixtures.flatMap(({ rsvp }, index) => {
  if (!rsvp) return []
  const createdAt = rsvp.createdAt ?? '2026-11-04T12:00:00.000Z'
  return [
    {
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
]
