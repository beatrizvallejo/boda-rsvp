/**
 * Cookie con el idioma que el invitado eligió con el selector en su enlace (`<token>:<idioma>`). Solo
 * manda en ese enlace: en otro (p. ej., los novios abriendo enlaces desde el panel) vuelve a mandar el
 * idioma de cada invitación.
 */
export const LOCALE_CHOSEN_COOKIE = 'boda_locale_elegido'

/** Idioma elegido para `token`, si se eligió en ese enlace. */
export function chosenLocaleFor(cookie: string | null | undefined, token: string): string | null {
  const [chosenToken, code] = (cookie ?? '').split(':')
  return chosenToken === token && code ? code : null
}
