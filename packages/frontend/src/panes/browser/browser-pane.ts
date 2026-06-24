import type { BrowserSnapshot, TabState } from '@saathi/shared'
import { bridge, type BrowserPort } from '../../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface BrowserOptions {
  browser?: BrowserPort
}

/**
 * The Browser pane: a tab strip + toolbar + address bar. Real web content lives
 * in WebContentsViews in the main process; this pane reports its content-region
 * bounds and reflects the pushed tab state. The address bar's URL-vs-search
 * decision is made by the domain `parseAddress` (in main).
 */
export function renderBrowser(host: HTMLElement, opts: BrowserOptions = {}): void {
  const browser = opts.browser ?? bridge.browserPort()
  let tabs: TabState[] = []
  let activeId: number | undefined
  let initialized = false

  host.innerHTML = `<div class="browser" data-pane="browser">
    <div class="br-strip">
      <div class="br-tabs" id="br-tabs"></div>
      <button class="br-newtab" id="br-newtab" title="New tab" aria-label="New tab">+</button>
    </div>
    <div class="br-toolbar">
      <button class="br-nav" id="br-back" title="Back" aria-label="Back" disabled>‹</button>
      <button class="br-nav" id="br-fwd" title="Forward" aria-label="Forward" disabled>›</button>
      <button class="br-nav" id="br-reload" title="Reload" aria-label="Reload">⟳</button>
      <input class="br-address" id="br-address" placeholder="Search DuckDuckGo or enter a URL" spellcheck="false" />
    </div>
    <div class="br-content" id="br-content"></div>
  </div>`

  const root = host.querySelector<HTMLElement>('.browser')!
  const tabsEl = host.querySelector<HTMLElement>('#br-tabs')!
  const content = host.querySelector<HTMLElement>('#br-content')!
  const address = host.querySelector<HTMLInputElement>('#br-address')!
  const back = host.querySelector<HTMLButtonElement>('#br-back')!
  const fwd = host.querySelector<HTMLButtonElement>('#br-fwd')!

  const active = (): TabState | undefined => tabs.find((t) => t.id === activeId)

  const draw = (): void => {
    tabsEl.innerHTML = tabs
      .map(
        (t) =>
          `<div class="br-tab${t.id === activeId ? ' active' : ''}" data-id="${t.id}">` +
          `<span class="br-tab-t">${esc(t.title || 'New tab')}</span>` +
          `<button class="br-tab-x" data-close="${t.id}" aria-label="Close tab">×</button></div>`,
      )
      .join('')
    const cur = active()
    if (document.activeElement !== address) address.value = cur?.url === 'about:blank' ? '' : (cur?.url ?? '')
    back.disabled = !cur?.canGoBack
    fwd.disabled = !cur?.canGoForward
  }

  const onSnap = (snap: BrowserSnapshot): void => {
    tabs = snap.tabs
    activeId = snap.activeId
    if (!initialized) {
      initialized = true
      if (tabs.length === 0) void browser.newTab() // open the first tab on entry
    }
    draw()
  }
  const unsub = browser.onEvent(onSnap)

  const reportBounds = (): void => {
    const r = content.getBoundingClientRect()
    void browser.setBounds({
      x: Math.round(r.x),
      y: Math.round(r.y),
      width: Math.round(r.width),
      height: Math.round(r.height),
    })
  }

  // Tab strip: switch on click, close on ×.
  tabsEl.addEventListener('click', (e) => {
    const el = e.target as HTMLElement
    const closeId = el.closest<HTMLElement>('.br-tab-x')?.dataset.close
    if (closeId) {
      void browser.closeTab(Number(closeId))
      return
    }
    const tabId = el.closest<HTMLElement>('.br-tab')?.dataset.id
    if (tabId) void browser.activate(Number(tabId))
  })
  host.querySelector<HTMLElement>('#br-newtab')!.addEventListener('click', () => void browser.newTab())
  back.addEventListener('click', () => activeId !== undefined && void browser.back(activeId))
  fwd.addEventListener('click', () => activeId !== undefined && void browser.forward(activeId))
  host
    .querySelector<HTMLElement>('#br-reload')!
    .addEventListener('click', () => activeId !== undefined && void browser.reload(activeId))
  address.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter' && activeId !== undefined) {
      e.preventDefault()
      void browser.navigate(activeId, address.value)
      address.blur()
    }
  })

  // Show the views, size them to the content region, and keep bounds current.
  void browser.setVisible(true)
  reportBounds()
  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(reportBounds) : undefined
  ro?.observe(content)
  window.addEventListener('resize', reportBounds)

  // When the pane leaves the DOM (navigated away), hide the views + clean up.
  const observer = new MutationObserver(() => {
    if (!document.contains(root)) {
      void browser.setVisible(false)
      unsub()
      ro?.disconnect()
      window.removeEventListener('resize', reportBounds)
      observer.disconnect()
    }
  })
  observer.observe(document.documentElement, { childList: true, subtree: true })

  draw()
}
