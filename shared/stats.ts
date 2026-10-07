import type { AdminInvitation, Stats } from './schemas'

/**
 * Métricas del panel (ver `statsSchema` para la definición de cada contador). Las usan
 * `GET /api/admin/stats` y el propio panel, que ya tiene la lista cargada.
 */
export function computeStats(invitations: AdminInvitation[]): Stats {
  const stats: Stats = {
    invitations: { total: invitations.length, confirmed: 0, pending: 0 },
    people: { confirmed: 0, pending: 0 },
    adults: 0,
    children: 0,
    whatsapp: { invitationsSent: 0, invitationsNotSent: 0, remindersSent: 0 },
    jointFlight: { invitations: 0, people: 0 },
  }

  for (const invitation of invitations) {
    const { rsvp } = invitation
    if (!rsvp) {
      stats.invitations.pending++
      stats.people.pending += 1
    } else {
      const adults = 1 + (rsvp.companionName ? 1 : 0)
      stats.invitations.confirmed++
      stats.adults += adults
      stats.children += rsvp.children
      stats.people.confirmed += adults + rsvp.children
      if (rsvp.jointFlight === 'yes') {
        stats.jointFlight.invitations++
        stats.jointFlight.people += adults + rsvp.children
      }
    }

    if (invitation.invitedSentAt) stats.whatsapp.invitationsSent++
    else stats.whatsapp.invitationsNotSent++
    stats.whatsapp.remindersSent += invitation.reminderCount
  }

  return stats
}
