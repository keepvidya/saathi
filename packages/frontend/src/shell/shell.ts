import { Router, type PaneId } from './router'
import { PANES, NAV, SETTINGS_NAV, type NavItem } from '../panes'
import { currentSkin, toggleTheme, setSkin } from '../theme/theme'
import { themeGalleryHtml } from '../theme/gallery'

const LOGO = `<svg viewBox="0 0 160 160" aria-hidden="true">
  <rect width="160" height="160" rx="36" style="fill:var(--logo-tile)"/>
  <rect x="50" y="50" width="38" height="80" rx="19" style="fill:var(--logo-mark)"/>
  <path d="M114 42 L118.5 55.5 L132 60 L118.5 64.5 L114 78 L109.5 64.5 L96 60 L109.5 55.5 Z" style="fill:var(--primary)"/>
</svg>`

const icon = (d: string) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${
    d
      .split('M')
      .filter(Boolean)
      .map((seg) => `<path d="M${seg.trim()}"/>`)
      .join('')
  }</svg>`

const navButton = (n: NavItem) =>
  `<button class="nav-item" data-pane="${n.id}" title="${n.label}">${icon(n.icon)}<span class="nav-label">${n.label}</span></button>`

function shellHtml(): string {
  return `
  <div class="app" id="app-grid">
    <aside class="rail">
      <button class="hamb" id="hamb" title="Toggle rail" aria-label="Toggle rail">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      <div class="railbrand"><span class="logo">${LOGO}</span><span class="rl bt">Saathi</span></div>
      <nav class="nav" id="nav">${NAV.map(navButton).join('')}</nav>
      <div class="nav navfoot" id="navfoot">${navButton(SETTINGS_NAV)}</div>
    </aside>
    <main class="main">
      <header class="topbar">
        <div class="topbar-spacer"></div>
        <button class="iconbtn" id="theme-gallery-btn" title="Themes" aria-label="Themes">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
        </button>
        <button class="iconbtn" id="theme-toggle" title="Toggle theme" aria-label="Toggle theme">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" id="theme-icon"></svg>
        </button>
        <div class="theme-menu" id="theme-menu" hidden></div>
      </header>
      <section class="body" id="body"></section>
    </main>
  </div>`
}

function themeIcon(): string {
  return currentSkin().base === 'dark'
    ? '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>'
    : '<circle cx="12" cy="12" r="4.2"/><path d="M12 2v2.4M12 19.6V22M4.2 4.2l1.7 1.7M18.1 18.1l1.7 1.7M2 12h2.4M19.6 12H22M4.2 19.8l1.7-1.7M18.1 5.9l1.7-1.7"/>'
}

export interface ShellHandle {
  router: Router
  go(id: PaneId): void
}

/** Mount the Saathi shell into root. Returns a handle (used by tests and the host). */
export function mountShell(root: HTMLElement): ShellHandle {
  root.innerHTML = shellHtml()
  const router = new Router()
  for (const p of PANES) router.register(p)

  const body = root.querySelector<HTMLElement>('#body')!
  const nav = root.querySelector<HTMLElement>('.rail')!
  const themeBtn = root.querySelector<HTMLElement>('#theme-toggle')!
  const themeIco = root.querySelector<HTMLElement>('#theme-icon')!
  const grid = root.querySelector<HTMLElement>('#app-grid')!

  const updateActive = (id: PaneId) =>
    root.querySelectorAll<HTMLElement>('.nav-item').forEach((b) =>
      b.classList.toggle('active', b.dataset.pane === id),
    )

  const go = (id: PaneId): void => {
    if (router.show(id, body)) updateActive(id)
  }

  nav.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('[data-pane]')
    if (btn) go(btn.dataset.pane as PaneId)
  })

  root.querySelector<HTMLElement>('#hamb')!.addEventListener('click', () =>
    grid.classList.toggle('expanded'),
  )

  const paintThemeIcon = () => (themeIco.innerHTML = themeIcon())
  themeBtn.addEventListener('click', () => {
    toggleTheme()
    paintThemeIcon()
  })
  paintThemeIcon()

  // Theme gallery popover
  const galBtn = root.querySelector<HTMLElement>('#theme-gallery-btn')!
  const menu = root.querySelector<HTMLElement>('#theme-menu')!
  const renderMenu = () => (menu.innerHTML = themeGalleryHtml())
  const closeMenu = () => menu.setAttribute('hidden', '')
  const openMenu = () => {
    renderMenu()
    menu.removeAttribute('hidden')
  }
  galBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (menu.hasAttribute('hidden')) openMenu()
    else closeMenu()
  })
  menu.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-skin]')
    if (!b) return
    setSkin(b.dataset.skin as string)
    paintThemeIcon()
    renderMenu()
  })
  document.addEventListener('click', (e) => {
    const t = e.target as Node
    if (!menu.hasAttribute('hidden') && !menu.contains(t) && !galBtn.contains(t)) closeMenu()
  })

  go('chat')
  return { router, go }
}
