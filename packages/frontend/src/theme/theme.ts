/**
 * Theme engine — KEEPVIDYA brand colours are LOCKED. Two hues: ink + copper; ONE accent (copper).
 * The only themes are **Light · Medium · Dark** (Knovex's set), all copper-accented.
 * Values are mirrored verbatim from the brand source of truth (`./keepvidya-theme.css` /
 * D:\Branding\Parent\keepvidya\keepvidya-theme.css + KEEPVIDYA-color-system.md).
 * DO NOT invent themes or colours. Each theme carries a COMPLETE token set applied inline on
 * <html> so it is deterministic and unit-testable.
 */
export type ThemeBase = 'light' | 'dark'
export interface Theme {
  id: string
  name: string
  base: ThemeBase
  /** swatch preview [bg, surface, accent] */
  sw: [string, string, string]
  vars: Record<string, string>
}

export const SKINVARS = [
  '--bg',
  '--surface',
  '--surface-2',
  '--surface-3',
  '--border',
  '--border-strong',
  '--text',
  '--text-secondary',
  '--text-muted',
  '--text-inverse',
  '--primary',
  '--primary-hover',
  '--primary-active',
  '--on-primary',
  '--primary-subtle',
  '--primary-border',
  '--focus-ring',
  '--link',
  '--success',
  '--success-subtle',
  '--warning',
  '--warning-subtle',
  '--error',
  '--error-subtle',
  '--info',
  '--info-subtle',
  '--shadow-sm',
  '--shadow-md',
  '--logo-tile',
  '--logo-mark',
] as const

const LIGHT_VARS: Record<string, string> = {
  '--bg': '#FBF8F3',
  '--surface': '#FFFFFF',
  '--surface-2': '#F4F1EA',
  '--surface-3': '#ECE6DC',
  '--border': '#E4DBCE',
  '--border-strong': '#CDC2B0',
  '--text': '#1B2A33',
  '--text-secondary': '#4A5C65',
  '--text-muted': '#6B7C85',
  '--text-inverse': '#FBF8F3',
  '--primary': '#C0703C',
  '--primary-hover': '#A85E2E',
  '--primary-active': '#8A4C24',
  '--on-primary': '#FFFFFF',
  '--primary-subtle': '#FBF1E9',
  '--primary-border': '#E8B894',
  '--focus-ring': '#D98E5A',
  '--link': '#A85E2E',
  '--success': '#3F7D5B',
  '--success-subtle': '#E7F0EB',
  '--warning': '#C28A2E',
  '--warning-subtle': '#F8EFDD',
  '--error': '#B0463C',
  '--error-subtle': '#F7E5E2',
  '--info': '#3E6B82',
  '--info-subtle': '#E4EDF1',
  '--shadow-sm': '0 1px 2px rgba(27,42,51,.06)',
  '--shadow-md': '0 4px 14px rgba(27,42,51,.10)',
  '--logo-tile': '#1B2A33',
  '--logo-mark': '#FBF8F3',
}

// Medium = dimmed light (only bg/surface differ, per the locked system).
const MEDIUM_VARS: Record<string, string> = {
  ...LIGHT_VARS,
  '--bg': '#F4F1EA',
  '--surface': '#FBF8F3',
  '--surface-2': '#ECE6DC',
  '--surface-3': '#E4DBCE',
}

const DARK_VARS: Record<string, string> = {
  '--bg': '#121D23',
  '--surface': '#1B2A33',
  '--surface-2': '#25363D',
  '--surface-3': '#2E4048',
  '--border': '#33474F',
  '--border-strong': '#45585F',
  '--text': '#F3EEE7',
  '--text-secondary': '#B4C0C5',
  '--text-muted': '#7E8E96',
  '--text-inverse': '#121D23',
  '--primary': '#D98E5A',
  '--primary-hover': '#E8A472',
  '--primary-active': '#C0703C',
  '--on-primary': '#121D23',
  '--primary-subtle': '#2A2118',
  '--primary-border': '#7A4A2A',
  '--focus-ring': '#E8A472',
  '--link': '#E0A06E',
  '--success': '#5FA67D',
  '--success-subtle': '#1C2C24',
  '--warning': '#D9A94E',
  '--warning-subtle': '#2C2616',
  '--error': '#D46A5F',
  '--error-subtle': '#2E1C1A',
  '--info': '#6CA0B8',
  '--info-subtle': '#18272E',
  '--shadow-sm': '0 1px 2px rgba(0,0,0,.40)',
  '--shadow-md': '0 6px 20px rgba(0,0,0,.45)',
  '--logo-tile': '#F3EEE7',
  '--logo-mark': '#1B2A33',
}

/** The brand copper accent (light + dark variants) — used to guard against off-brand themes. */
export const COPPER_ACCENTS = ['#C0703C', '#D98E5A'] as const

export const THEMES: Theme[] = [
  { id: 'light', name: 'Light', base: 'light', sw: ['#FBF8F3', '#FFFFFF', '#C0703C'], vars: LIGHT_VARS },
  { id: 'medium', name: 'Medium', base: 'light', sw: ['#F4F1EA', '#FBF8F3', '#C0703C'], vars: MEDIUM_VARS },
  { id: 'dark', name: 'Dark', base: 'dark', sw: ['#121D23', '#1B2A33', '#D98E5A'], vars: DARK_VARS },
]

const SKIN_KEY = 'kv-skin'
const BASE_KEY = 'kv-theme'
const perBaseKey = (base: ThemeBase) => `kv-skin-${base}`

let current = THEMES[0]

function safeSet(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage may be unavailable; non-fatal */
  }
}
function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}

export function themesByBase(base: ThemeBase): Theme[] {
  return THEMES.filter((t) => t.base === base)
}

export function setSkin(id: string, save = true): Theme {
  const theme = getTheme(id)
  current = theme
  const root = document.documentElement
  root.setAttribute('data-theme', theme.id)
  for (const v of SKINVARS) root.style.removeProperty(v)
  for (const [k, val] of Object.entries(theme.vars)) root.style.setProperty(k, val)
  if (save) {
    safeSet(SKIN_KEY, theme.id)
    safeSet(BASE_KEY, theme.base)
    safeSet(perBaseKey(theme.base), theme.id)
  }
  return theme
}

export function loadSkin(): Theme {
  return setSkin(safeGet(SKIN_KEY) ?? 'light', false)
}

export function currentSkin(): Theme {
  return current
}

/** Quick light/dark flip to the REMEMBERED skin of the opposite base (default light/dark). */
export function toggleTheme(): Theme {
  const target: ThemeBase = current.base === 'dark' ? 'light' : 'dark'
  const remembered = safeGet(perBaseKey(target)) ?? (target === 'dark' ? 'dark' : 'light')
  return setSkin(remembered)
}
