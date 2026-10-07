import { randomInt, randomUUID } from 'node:crypto'
import type {
  AdminInvitation,
  Invitation,
  InvitationCreate,
  PublicInvitationResponse,
  PublicRsvp,
  Rsvp,
} from '#shared/schemas'
import { idSchema, slugifyName, TOKEN_CODE_LENGTH, tokenSchema } from '#shared/schemas'
import { isRsvpClosed, RSVP_DEADLINE } from '#shared/config'
import { useDataAdapter } from './adapters'
import { apiError } from './http'

const CODE_ALPHABET = 'abcdefghijklmnopqrstuvwxyz0123456789'

/**
 * Token del enlace personal: nombre legible + código aleatorio de `crypto.randomInt`.
 * "Ana García López" → "ana-garcia-lopez-k7f3q2". El código impide adivinar el enlace de otro invitado.
 */
export function generateToken(guestName: string): string {
  let code = ''
  for (let i = 0; i < TOKEN_CODE_LENGTH; i++) code += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]
  return `${slugifyName(guestName)}-${code}`
}

export function buildInvitation(input: InvitationCreate, now = new Date()): Invitation {
  return {
    id: randomUUID(),
    token: generateToken(input.guestName),
    label: input.label,
    guestName: input.guestName,
    locale: input.locale,
    phone: input.phone,
    invitedSentAt: null,
    reminderSentAt: null,
    reminderCount: 0,
    createdAt: now.toISOString(),
  }
}

/** Busca por token. Un token con formato inválido se trata igual que uno inexistente (404). */
export async function findInvitationByToken(token: string | undefined): Promise<Invitation> {
  const parsed = tokenSchema.safeParse(token)
  if (!parsed.success) throw apiError(404, 'not_found')
  const invitation = await useDataAdapter().getInvitationByToken(parsed.data)
  if (!invitation) throw apiError(404, 'not_found')
  return invitation
}

export async function findInvitationById(id: string | undefined): Promise<Invitation> {
  const parsed = idSchema.safeParse(id)
  if (!parsed.success) throw apiError(404, 'not_found')
  const invitation = await useDataAdapter().getInvitation(parsed.data)
  if (!invitation) throw apiError(404, 'not_found')
  return invitation
}

export function toPublicRsvp(rsvp: Rsvp): PublicRsvp {
  const { invitationId: _invitationId, updatedBy: _updatedBy, ...rest } = rsvp
  return rest
}

/**
 * Respuesta de `GET /api/rsvp/:token`: lista blanca de campos. Nunca teléfono ni id, y tampoco
 * `label`, que es una etiqueta interna de los novios.
 */
export function toPublicInvitationResponse(
  invitation: Invitation,
  rsvp: Rsvp | null,
): PublicInvitationResponse {
  return {
    invitation: {
      guestName: invitation.guestName,
      locale: invitation.locale,
    },
    rsvp: rsvp ? toPublicRsvp(rsvp) : null,
    deadline: RSVP_DEADLINE,
    closed: isRsvpClosed(),
  }
}

export async function listAdminInvitations(): Promise<AdminInvitation[]> {
  const data = useDataAdapter()
  const [invitations, rsvps] = await Promise.all([data.listInvitations(), data.listRsvps()])
  const byInvitation = new Map(rsvps.map((rsvp) => [rsvp.invitationId, rsvp]))
  return invitations.map((invitation) => ({
    ...invitation,
    rsvp: byInvitation.get(invitation.id) ?? null,
  }))
}
