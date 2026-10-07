import { expect, type Page } from '@playwright/test'

/**
 * Comprobaciones móviles básicas de `docs/mobile-checklist.md` sobre la pantalla actual:
 * sin scroll horizontal, campos a 16px o más y controles visibles de 44×44px o más.
 */
export async function expectMobileBasics(page: Page, screen: string) {
  const report = await page.evaluate(() => {
    const visible = (el: Element) => {
      const box = el.getBoundingClientRect()
      const style = getComputedStyle(el)
      return (
        box.width > 1 &&
        box.height > 1 &&
        style.visibility !== 'hidden' &&
        !el.closest('[inert], [aria-hidden="true"], .sr-only')
      )
    }
    const describe = (el: Element) =>
      `${el.tagName.toLowerCase()} «${(el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 30)}»`

    const overflow = document.documentElement.scrollWidth - window.innerWidth
    const smallText = [...document.querySelectorAll('input, select, textarea')]
      .filter(visible)
      .filter((el) => parseFloat(getComputedStyle(el).fontSize) < 16)
      .map(describe)
    const smallTargets = [...document.querySelectorAll('button, input, select, textarea, a.btn')]
      .filter(visible)
      .filter((el) => {
        const box = el.getBoundingClientRect()
        return box.width < 44 || box.height < 44
      })
      .map(describe)
    return { overflow, smallText, smallTargets }
  })

  expect(report.overflow, `${screen}: scroll horizontal`).toBeLessThanOrEqual(0)
  expect(report.smallText, `${screen}: campos con texto de menos de 16px`).toEqual([])
  expect(report.smallTargets, `${screen}: controles de menos de 44×44px`).toEqual([])
}
