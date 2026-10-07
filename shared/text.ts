/** Quita tildes y diacríticos (ș→s, ñ→n, ă→a): para buscar, comparar nombres y formar URLs. */
export function foldDiacritics(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

/** Clave para comparar textos sin distinguir mayúsculas, tildes ni espacios de los extremos. */
export function compareKey(text: string): string {
  return foldDiacritics(text).trim().toLowerCase()
}
