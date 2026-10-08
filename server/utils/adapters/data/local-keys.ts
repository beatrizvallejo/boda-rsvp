// Distribución de claves del adaptador `local`. La comparten el adaptador y los scripts seed/reset,
// así que no depende de Nitro.

/** Punto de montaje de Nitro storage (ver `nitro.storage` en nuxt.config.ts). */
export const LOCAL_STORAGE_MOUNT = 'db'
/** Carpeta del driver `fs`, relativa a la raíz del proyecto. */
export const LOCAL_STORAGE_BASE = './.data/db'

export const localKeys = {
  invitation: (id: string) => `invitations:${id}`,
  invitationsPrefix: 'invitations',
  /** Índice token → id de invitación. */
  token: (token: string) => `tokens:${token}`,
  rsvp: (invitationId: string) => `rsvps:${invitationId}`,
  rsvpsPrefix: 'rsvps',
  template: (kind: string, locale: string) => `templates:${kind}-${locale}`,
  templatesPrefix: 'templates',
  /** Documento único con la sección de vuelos (Fase 6b). */
  flights: 'settings:flights',
  /** Documento único con alojamiento y traslados (Fase 6d). */
  stay: 'settings:stay',
}
