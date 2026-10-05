import { randomBytes, randomUUID } from 'node:crypto'
import type {
  AdminInvitation,
  Invitation,
  InvitationCreate,
  PublicInvitationResponse,
  PublicRsvp,
  Rsvp,
} from '#shared/schemas'
import { idSchema, tokenSchema } from '#shared/schemas'
import { isRsvpClosed, RSVP_DEADLINE } from '#shared/config'
import { useDataAdapter } from './adapters'

/** Token del enlace personal: 32 bytes de `crypto.randomBytes` (256 bits) en base64url. */
export function generateToken(): string {
  return randomBytes(32).toString('base64url')
}

export function buildInvitation(input: InvitationCreate, now = new Date()): Invitation {
  return {
    id: randomUUID(),
    token: generateToken(),
    label: input.label,
    guestNames: input.guestNames,
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
  if (!tokenSchema.safeParse(token).success) throw apiError(404, 'not_found')
  const invitation = await useDataAdapter().getInvitationByToken(token as string)
  if (!invitation) throw apiError(404, 'not_found')
  return invitation
}

export async function findInvitationById(id: string | undefined): Promise<Invitation> {
  if (!idSchema.safeParse(id).success) throw apiError(404, 'not_found')
  const invitation = await useDataAdapter().getInvitation(id as string)
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
      guestNames: invitation.guestNames,
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
