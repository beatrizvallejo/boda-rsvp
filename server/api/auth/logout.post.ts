import { useAuthAdapter } from '../../utils/adapters'

export default defineEventHandler(async (event) => {
  await useAuthAdapter().logout(event)
  setResponseStatus(event, 204)
  return null
})
