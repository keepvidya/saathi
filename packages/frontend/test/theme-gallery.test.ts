import { beforeEach, describe, expect, it } from 'vitest'
import { mountShell } from '../src/shell/shell'
import { themeGalleryHtml } from '../src/theme/gallery'
import { setSkin } from '../src/theme/theme'

beforeEach(() => {
  localStorage.clear()
  document.body.innerHTML = ''
  setSkin('paper')
})

describe('TC-01.2.1 — theme gallery', () => {
  it('builder renders the 3 brand swatches and marks the active one', () => {
    setSkin('light')
    const html = themeGalleryHtml()
    expect((html.match(/data-skin=/g) || []).length).toBe(3)
    expect(html).toContain('data-skin="light"')
    expect(html).toContain('data-skin="medium"')
    expect(html).toContain('data-skin="dark"')
    const div = document.createElement('div')
    div.innerHTML = html
    expect(div.querySelector('.tsw.on')?.getAttribute('data-skin')).toBe('light')
  })

  it('popover opens, applies a theme, marks active, closes on outside click', () => {
    setSkin('light')
    const root = document.createElement('div')
    document.body.append(root)
    mountShell(root)

    const menu = root.querySelector<HTMLElement>('#theme-menu')!
    expect(menu.hasAttribute('hidden')).toBe(true)

    root.querySelector<HTMLElement>('#theme-gallery-btn')!.click()
    expect(menu.hasAttribute('hidden')).toBe(false)
    expect(menu.querySelectorAll('[data-skin]').length).toBe(3)

    menu.querySelector<HTMLElement>('[data-skin="dark"]')!.click()
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#D98E5A')
    expect(menu.querySelector('.tsw.on')?.getAttribute('data-skin')).toBe('dark')

    document.body.click() // outside click
    expect(menu.hasAttribute('hidden')).toBe(true)
  })
})
