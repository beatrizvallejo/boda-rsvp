import type { AdminInvitation, Stats } from '#shared/schemas'

/** Métricas del panel (ver `statsSchema` para la definición de cada contador). */
export function computeStats(invitations: AdminInvitation[]): Stats {
  const stats: Stats = {
    invitations: { total: invitations.length, attending: 0, declined: 0, pending: 0 },
    people: { attending: 0, declined: 0, pending: 0 },
    attendingAdults: 0,
    attendingChildren: 0,
    whatsapp: { invitationsSent: 0, invitationsNotSent: 0, remindersSent: 0 },
  }

  for (const invitation of invitations) {
    const { rsvp } = invitation
    if (!rsvp) {
      stats.invitations.pending++
      stats.people.pending += invitation.guestNames.length
    } else if (rsvp.attending) {
      const adults = rsvp.guestNames.length + (rsvp.companionName ? 1 : 0)
      stats.invitations.attending++
      stats.attendingAdults += adults
      stats.attendingChildren += rsvp.children
      stats.people.attending += adults + rsvp.children
    } else {
      stats.invitations.declined++
      stats.people.declined += rsvp.guestNames.length
    }

    if (invitation.invitedSentAt) stats.whatsapp.invitationsSent++
    else stats.whatsapp.invitationsNotSent++
    stats.whatsapp.remindersSent += invitation.reminderCount
  }

  return stats
}
