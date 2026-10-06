import { formatRsvpNotification } from './format'
import type { NotifierAdapter } from './types'

/** Notifier de desarrollo: imprime el aviso en el log del servidor en lugar de enviar un email. */
export function createConsoleNotifierAdapter(siteUrl: string): NotifierAdapter {
  return {
    async notifyRsvp(notification) {
      const { subject, text } = formatRsvpNotification(notification, siteUrl)
      const replyTo = notification.replyTo ? `\nReply-To: ${notification.replyTo}` : ''
      console.info(
        `\n──── [notifier:console] ────${replyTo}\nAsunto: ${subject}\n\n${text}\n────────────────────────────\n`,
      )
    },
  }
}
