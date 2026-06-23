import { beforeEach, describe, expect, it } from 'vitest'
import { setSkin, loadSkin, getTheme, currentSkin, toggleTheme, SKINVARS } from '../src/theme/theme'

const root = () => document.documentElement

beforeEach(() => {
  localStorage.clear()
  root().removeAttribute('data-theme')
  for (const v of SKINVARS) root().style.removeProperty(v)
})

describe('TC-00.1.1 — theme applies, clears, persists', () => {
  it('step 1: setSkin(light) → light + light --bg', () => {
    setSkin('light')
    expect(root().getAttribute('data-theme')).toBe('light')
    expect(root().style.getPropertyValue('--bg')).toBe(getTheme('light').vars['--bg'])
  })

  it('step 2: setSkin(dark) → dark, prior vars replaced', () => {
    setSkin('light')
    setSkin('dark')
    expect(root().getAttribute('data-theme')).toBe('dark')
    expect(root().style.getPropertyValue('--bg')).toBe(getTheme('dark').vars['--bg'])
    expect(root().style.getPropertyValue('--primary')).toBe(getTheme('dark').vars['--primary'])
  })

  it('step 3: persists kv-skin + kv-theme', () => {
    setSkin('dark')
    expect(localStorage.getItem('kv-skin')).toBe('dark')
    expect(localStorage.getItem('kv-theme')).toBe('dark')
  })

  it('step 4: loadSkin restores from storage', () => {
    setSkin('dark')
    setSkin('light', false)
    loadSkin()
    expect(root().getAttribute('data-theme')).toBe('dark')
    expect(currentSkin().id).toBe('dark')
  })

  it('unknown id falls back to light; toggle flips base', () => {
    setSkin('nope')
    expect(currentSkin().id).toBe('light')
    toggleTheme()
    expect(currentSkin().base).toBe('dark')
    toggleTheme()
    expect(currentSkin().base).toBe('light')
  })

  it('survives localStorage failures (safeSet/safeGet catch paths)', () => {
    const origSet = Storage.prototype.setItem
    const origGet = Storage.prototype.getItem
    Storage.prototype.setItem = () => {
      throw new Error('storage denied')
    }
    Storage.prototype.getItem = () => {
      throw new Error('storage denied')
    }
    try {
      expect(() => setSkin('dark')).not.toThrow()
      expect(loadSkin().id).toBe('light')
    } finally {
      Storage.prototype.setItem = origSet
      Storage.prototype.getItem = origGet
    }
  })
})
