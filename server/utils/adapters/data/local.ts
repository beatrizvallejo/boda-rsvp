import type { Storage } from 'unstorage'
import type { z } from 'zod'
import { invitationSchema, messageTemplateSchema, rsvpSchema } from '#shared/schemas'
import { localKeys, LOCAL_STORAGE_MOUNT } from './local-keys'
import type { DataAdapter } from './types'

/**
 * Adaptador de desarrollo: Nitro storage con driver `fs` en `.data/db`.
 * Cada lectura se valida con el esquema Zod, así que un archivo editado a mano no rompe la API en silencio.
 * No es transaccional: suficiente para un único proceso de desarrollo.
 */
export function createLocalDataAdapter(
  storage: Storage = useStorage(LOCAL_STORAGE_MOUNT),
): DataAdapter {
  async function readAll<T>(prefix: string, schema: z.ZodType<T>): Promise<T[]> {
    const keys = await storage.getKeys(prefix)
    const items = await storage.getItems(keys)
    return items.map(({ value }) => schema.parse(value))
  }

  async function readOne<T>(key: string, schema: z.ZodType<T>): Promise<T | null> {
    const value = await storage.getItem(key)
    return value === null ? null : schema.parse(value)
  }

  return {
    async listInvitations() {
      const invitations = await readAll(localKeys.invitationsPrefix, invitationSchema)
      return invitations.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    },

    getInvitation(id) {
      return readOne(localKeys.invitation(id), invitationSchema)
    },

    async getInvitationByToken(token) {
      const id = await storage.getItem<string>(localKeys.token(token))
      if (typeof id !== 'string') return null
      const invitation = await readOne(localKeys.invitation(id), invitationSchema)
      // El índice podría quedar desfasado si se edita `.data/` a mano.
      return invitation?.token === token ? invitation : null
    },

    async insertInvitations(invitations) {
      for (const invitation of invitations) {
        if (
          (await storage.hasItem(localKeys.invitation(invitation.id))) ||
          (await storage.hasItem(localKeys.token(invitation.token)))
        ) {
          throw new Error(`La invitación ${invitation.id} o su token ya existen`)
        }
      }
      for (const invitation of invitations) {
        await storage.setItem(localKeys.invitation(invitation.id), invitation)
        await storage.setItem(localKeys.token(invitation.token), invitation.id)
      }
    },

    async updateInvitation(invitation) {
      const current = await readOne(localKeys.invitation(invitation.id), invitationSchema)
      if (!current || current.token !== invitation.token) {
        throw new Error(`No se puede actualizar la invitación ${invitation.id}`)
      }
      await storage.setItem(localKeys.invitation(invitation.id), invitation)
    },

    async deleteInvitation(id) {
      const current = await readOne(localKeys.invitation(id), invitationSchema)
      if (!current) return false
      await storage.removeItem(localKeys.rsvp(id))
      await storage.removeItem(localKeys.token(current.token))
      await storage.removeItem(localKeys.invitation(id))
      return true
    },

    listRsvps() {
      return readAll(localKeys.rsvpsPrefix, rsvpSchema)
    },

    getRsvp(invitationId) {
      return readOne(localKeys.rsvp(invitationId), rsvpSchema)
    },

    async saveRsvp(rsvp) {
      if (!(await storage.hasItem(localKeys.invitation(rsvp.invitationId)))) {
        throw new Error(`La invitación ${rsvp.invitationId} no existe`)
      }
      await storage.setItem(localKeys.rsvp(rsvp.invitationId), rsvp)
    },

    async deleteRsvp(invitationId) {
      if (!(await storage.hasItem(localKeys.rsvp(invitationId)))) return false
      await storage.removeItem(localKeys.rsvp(invitationId))
      return true
    },

    listTemplates() {
      return readAll(localKeys.templatesPrefix, messageTemplateSchema)
    },

    getTemplate(kind, locale) {
      return readOne(localKeys.template(kind, locale), messageTemplateSchema)
    },

    async saveTemplate(template) {
      await storage.setItem(localKeys.template(template.kind, template.locale), template)
    },
  }
}
