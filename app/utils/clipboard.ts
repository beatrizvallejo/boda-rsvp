/**
 * Copia texto al portapapeles. `navigator.clipboard` solo existe en contextos seguros (`https` o
 * `localhost`): al probar en el móvil con `dev:mobile` (`http://<IP>`) no está, y se usa el método
 * clásico con un `textarea` temporal. Devuelve si se ha copiado.
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // Sin permiso: se prueba el método clásico.
  }
  const area = document.createElement('textarea')
  area.value = text
  area.setAttribute('readonly', '')
  // Fuera de la vista y a 16px, para que iOS no haga zoom ni mueva la página.
  area.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px'
  document.body.append(area)
  area.select()
  area.setSelectionRange(0, text.length)
  try {
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    area.remove()
  }
}
