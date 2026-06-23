import { beforeEach, describe, expect, it } from 'vitest'
import {
  THEMES,
  COPPER_ACCENTS,
  setSkin,
  toggleTheme,
  currentSkin,
  themesByBase,
  getTheme,
  SKINVARS,
} from '../src/theme/theme'

const root = () => document.documentElement

beforeEach(() => {
  localStorage.clear()
  root().removeAttribute('data-theme')
  for (const v of SKINVARS) root().style.removeProperty(v)
  setSkin('light', false)
})

describe('TC-01.1.1 — brand-locked Light/Medium/Dark apply their tokens', () => {
  it('exactly Light, Medium, Dark (2 light + 1 dark); each applies bg + primary', () => {
    expect(THEMES.map((t) => t.id)).toEqual(['light', 'medium', 'dark'])
    expect(themesByBase('light').map((t) => t.id)).toEqual(['light', 'medium'])
    expect(themesByBase('dark').map((t) => t.id)).toEqual(['dark'])
    for (const t of THEMES) {
      setSkin(t.id)
      expect(root().getAttribute('data-theme')).toBe(t.id)
      expect(root().style.getPropertyValue('--bg')).toBe(t.vars['--bg'])
      expect(root().style.getPropertyValue('--primary')).toBe(t.vars['--primary'])
    }
  })
})

describe('TC-01.1.2 — brand lock: copper is the only accent, no decorative backdrops', () => {
  it('every theme primary is brand copper; no theme sets --bg-image', () => {
    for (const t of THEMES) {
      expect(COPPER_ACCENTS).toContain(t.vars['--primary'])
      expect(t.vars['--bg-image']).toBeUndefined()
    }
    // Medium is a true dimmed-light (same copper, only bg/surface differ from Light)
    const light = getTheme('light').vars
    const medium = getTheme('medium').vars
    expect(medium['--primary']).toBe(light['--primary'])
    expect(medium['--bg']).not.toBe(light['--bg'])
  })
})

describe('TC-01.1.3 — quick toggle remembers the per-base skin', () => {
  it('defaults the first time, then remembers the last skin per base', () => {
    setSkin('dark')
    toggleTheme()
    expect(currentSkin().base).toBe('light')
    expect(currentSkin().id).toBe('light') // default light, first time

    setSkin('medium') // remember light = medium
    setSkin('dark')
    toggleTheme()
    expect(currentSkin().id).toBe('medium') // remembered, not the default
  })
})
