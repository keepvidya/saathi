import { themesByBase, currentSkin, type Theme } from './theme'

function swatch(t: Theme): string {
  const active = t.id === currentSkin().id
  return `<button class="tsw${active ? ' on' : ''}" data-skin="${t.id}" title="${t.name}" aria-pressed="${active}">
    <span class="tsw-prev" style="background:${t.sw[0]}"><span class="tsw-card" style="background:${t.sw[1]}"></span><span class="tsw-dot" style="background:${t.sw[2]}"></span></span>
    <span class="tsw-name">${t.name}</span>
  </button>`
}

/**
 * View-model: the theme gallery popover markup. Brand-locked Light/Medium/Dark only.
 * Active theme gets `.on`.
 */
export function themeGalleryHtml(): string {
  const group = (base: 'light' | 'dark') => themesByBase(base).map(swatch).join('')
  return `<div class="tm-h">Theme</div>
    <div class="tm-group">Light</div><div class="tm-grid">${group('light')}</div>
    <div class="tm-group">Dark</div><div class="tm-grid">${group('dark')}</div>`
}
