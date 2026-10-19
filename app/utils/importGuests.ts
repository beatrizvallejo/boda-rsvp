// Importación de la lista de invitados: texto pegado desde Excel/Sheets (tabuladores) o un .csv
// (`;` o `,`). Columnas: nombre, idioma, teléfono, etiqueta. Con cabecera se admite cualquier orden.
import { invitationCreateSchema, normalizePhone, type InvitationCreate } from '#shared/schemas'
import { compareKey } from '#shared/text'

export interface ImportRow {
  /** Número de línea en el texto pegado (empieza en 1). */
  line: number
  raw: { nombre: string; idioma: string; telefono: string; etiqueta: string }
  data: InvitationCreate | null
  /** Motivo por el que la fila no se importa. */
  error: string | null
  /** Aviso que no impide importarla (p. ej., otro invitado con el mismo nombre y otro teléfono). */
  warning: string | null
}

/** Invitación ya guardada o fila anterior, para detectar duplicados. */
export interface KnownGuest {
  guestName: string
  phone: string | null
}

type Column = keyof ImportRow['raw']
const DEFAULT_ORDER: Column[] = ['nombre', 'idioma', 'telefono', 'etiqueta']

const HEADER_ALIASES: Record<string, Column> = {
  nombre: 'nombre',
  invitado: 'nombre',
  name: 'nombre',
  idioma: 'idioma',
  lengua: 'idioma',
  locale: 'idioma',
  telefono: 'telefono',
  movil: 'telefono',
  phone: 'telefono',
  whatsapp: 'telefono',
  etiqueta: 'etiqueta',
  grupo: 'etiqueta',
  label: 'etiqueta',
}

const LOCALE_ALIASES: Record<string, 'es' | 'ro'> = {
  es: 'es',
  espanol: 'es',
  castellano: 'es',
  ro: 'ro',
  rumano: 'ro',
  romana: 'ro',
}

/**
 * Teléfono tal como llega de una hoja de cálculo. Excel suele convertir `+34600111222` en el número
 * `34600111222` (sin `+`), y algunos lo escriben con `00`: si empieza por el prefijo de España (34) o
 * Rumanía (40) y tiene la longitud de un móvil, se le pone el `+`. Lo demás se valida tal cual.
 */
export function fixSpreadsheetPhone(value: string): string {
  const phone = normalizePhone(value).replace(/^00/, '+')
  return /^(34|40)\d{9}$/.test(phone) ? `+${phone}` : phone
}

/** Separador más probable de la primera línea: tabulador (pegado de hoja de cálculo), `;` o `,`. */
function detectDelimiter(firstLine: string): string {
  for (const candidate of ['\t', ';', ',']) if (firstLine.includes(candidate)) return candidate
  return '\t'
}

/** Parser CSV mínimo con comillas dobles (campos con separadores o saltos de línea dentro). */
function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let quoted = false
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (quoted) {
      if (char === '"' && text[i + 1] === '"') {
        cell += '"'
        i++
      } else if (char === '"') quoted = false
      else cell += char
    } else if (char === '"' && cell === '') quoted = true
    else if (char === delimiter) {
      row.push(cell)
      cell = ''
    } else if (char === '\n' || char === '\r') {
      if (char === '\r' && text[i + 1] === '\n') i++
      row.push(cell)
      rows.push(row)
      row = []
      cell = ''
    } else cell += char
  }
  if (cell !== '' || row.length) {
    row.push(cell)
    rows.push(row)
  }
  return rows
}

/**
 * Duplicado = mismo nombre y mismo teléfono (o ninguno de los dos lo tiene). Con apodos es normal que
 * se repita el nombre («Cris» de Keko y «Cris» de Ro): con otro teléfono se importa con un aviso.
 */
export function parseGuestList(text: string, existing: KnownGuest[] = []): ImportRow[] {
  const clean = text.replace(/^\uFEFF/, '')
  const firstLine = clean.split(/\r?\n/, 1)[0] ?? ''
  const table = parseDelimited(clean, detectDelimiter(firstLine))

  let order = DEFAULT_ORDER
  let start = 0
  const header = (table[0] ?? []).map((cell) => HEADER_ALIASES[compareKey(cell)])
  if (header.includes('nombre')) {
    order = header as Column[]
    start = 1
  }

  const seen = existing.map((g) => ({ key: compareKey(g.guestName), phone: g.phone }))
  const rows: ImportRow[] = []
  for (let index = start; index < table.length; index++) {
    const cells = table[index]!
    if (cells.every((cell) => cell.trim() === '')) continue
    const raw = { nombre: '', idioma: '', telefono: '', etiqueta: '' }
    order.forEach((column, i) => {
      if (column) raw[column] = (cells[i] ?? '').trim()
    })

    const row: ImportRow = { line: index + 1, raw, data: null, error: null, warning: null }
    rows.push(row)

    const locale = raw.idioma ? LOCALE_ALIASES[compareKey(raw.idioma)] : 'es'
    if (!raw.nombre) {
      row.error = 'Falta el nombre.'
      continue
    }
    if (!locale) {
      row.error = `Idioma «${raw.idioma}» desconocido: usa ES o RO.`
      continue
    }
    const parsed = invitationCreateSchema.safeParse({
      guestName: raw.nombre,
      locale,
      phone: fixSpreadsheetPhone(raw.telefono),
      label: raw.etiqueta,
    })
    if (!parsed.success) {
      row.error = firstFieldError(parsed.error, INVITATION_MESSAGES).message
      continue
    }
    const key = compareKey(parsed.data.guestName)
    const namesakes = seen.filter((g) => g.key === key)
    if (namesakes.some((g) => g.phone === parsed.data.phone)) {
      row.error = parsed.data.phone
        ? 'Ya hay una invitación con este nombre y este teléfono: no se importa.'
        : 'Ya hay una invitación con este nombre (sin teléfono para distinguirlas): no se importa.'
      continue
    }
    if (namesakes.length) {
      row.warning = 'Ya hay otro invitado con este nombre (otro teléfono): se importa igualmente.'
    }
    seen.push({ key, phone: parsed.data.phone })
    row.data = parsed.data
  }
  return rows
}
