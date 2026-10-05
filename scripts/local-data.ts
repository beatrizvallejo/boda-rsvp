// pnpm seed  → vacía .data/db y carga los fixtures (validados con los esquemas Zod)
// pnpm reset → vacía .data/db
// Solo para el adaptador `local`. Usa la misma carpeta y las mismas claves que el servidor.
import { resolve } from 'node:path'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { fixtureInvitations, fixtureRsvps, fixtureTemplates } from '../server/fixtures/index'
import { localKeys, LOCAL_STORAGE_BASE } from '../server/utils/adapters/data/local-keys'
import { invitationSchema, messageTemplateSchema, rsvpSchema } from '../shared/schemas'

const command = process.argv[2]
if (command !== 'seed' && command !== 'reset') {
  console.error('Uso: tsx scripts/local-data.ts <seed|reset>')
  process.exit(1)
}

const base = resolve(LOCAL_STORAGE_BASE)
const storage = createStorage({ driver: fsDriver({ base }) })

await storage.clear()
console.info(`Vaciado ${base}`)

if (command === 'seed') {
  for (const raw of fixtureInvitations) {
    const invitation = invitationSchema.parse(raw)
    await storage.setItem(localKeys.invitation(invitation.id), invitation)
    await storage.setItem(localKeys.token(invitation.token), invitation.id)
  }
  for (const raw of fixtureRsvps) {
    const rsvp = rsvpSchema.parse(raw)
    await storage.setItem(localKeys.rsvp(rsvp.invitationId), rsvp)
  }
  for (const raw of fixtureTemplates) {
    const template = messageTemplateSchema.parse(raw)
    await storage.setItem(localKeys.template(template.kind, template.locale), template)
  }
  console.info(
    `Cargados ${fixtureInvitations.length} invitaciones, ${fixtureRsvps.length} respuestas y ${fixtureTemplates.length} plantillas.`,
  )
  console.info('Ejemplo: http://localhost:3000/r/' + fixtureInvitations[0]!.token)
}

await storage.dispose()
