/**
 * Neutraliza fórmulas (inyección CSV): una celda que empieza por `=`, `+`, `-`, `@`, tabulador o
 * retorno de carro se prefija con `'` para que Excel o Sheets la traten como texto.
 */
export function neutralizeCell(value: string): string {
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value
}

/** Celda CSV con separador `;`: se entrecomilla si contiene `;`, comillas o saltos de línea. */
export function csvCell(value: string | number | null | undefined): string {
  const text = neutralizeCell(value === null || value === undefined ? '' : String(value))
  return /[;"\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

/**
 * CSV con `;` (lo que espera Excel en español), CRLF y BOM UTF-8 para que se vean bien las tildes y
 * los diacríticos rumanos.
 */
export function toCsv(rows: (string | number | null | undefined)[][]): string {
  return '\uFEFF' + rows.map((row) => row.map(csvCell).join(';')).join('\r\n') + '\r\n'
}
