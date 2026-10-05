import { formatRsvpNotification } from './format'
import type { NotifierAdapter } from './types'

/** Notifier de desarrollo: imprime el aviso en el log del servidor en lugar de enviar un email. */
export function createConsoleNotifierAdapter(): NotifierAdapter {
  return {
    async notifyRsvp(notification) {
      const { text } = formatRsvpNotification(notification)
      const replyTo = notification.replyTo ? `\nReply-To: ${notification.replyTo}` : ''
      console.info(
        `\n──── [notifier:console] ────${replyTo}\n${text}\n────────────────────────────\n`,
      )
    },
  }
}
