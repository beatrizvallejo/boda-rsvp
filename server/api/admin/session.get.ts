import { requireAdmin } from '../../utils/admin'

export default defineEventHandler((event) => requireAdmin(event))
