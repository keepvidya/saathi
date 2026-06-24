import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderBrowser } from '../src/panes/browser/browser-pane'
import type { BrowserPort } from '../src/bridge/saathi.bridge'
import type { BrowserSnapshot, TabState } from '@saathi/shared'

const tab = (over: Partial<TabState>): TabState => ({
  id: 1,
  title: 'New tab',
  url: 'about:blank',
  loading: false,
  canGoBack: false,
  canGoForward: false,
  ...over,
})

function makeStub() {
  let emit: (s: BrowserSnapshot) => void = () => {}
  const port: BrowserPort = {
    newTab: vi.fn().mockResolvedValue({ tabs: [], activeId: undefined }),
    closeTab: vi.fn().mockResolvedValue(undefined),
    activate: vi.fn().mockResolvedValue(undefined),
    navigate: vi.fn().mockResolvedValue(undefined),
    back: vi.fn().mockResolvedValue(undefined),
    forward: vi.fn().mockResolvedValue(undefined),
    reload: vi.fn().mockResolvedValue(undefined),
    setBounds: vi.fn().mockResolvedValue(undefined),
    setVisible: vi.fn().mockResolvedValue(undefined),
    onEvent: (cb) => {
      emit = cb
      return () => {}
    },
  }
  return { port, push: (s: BrowserSnapshot) => emit(s) }
}

describe('TC-15.2 — Browser pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })

  it('on entry it shows the views and opens the first tab when none exist', () => {
    const { port, push } = makeStub()
    renderBrowser(host, { browser: port })
    expect(port.setVisible).toHaveBeenCalledWith(true)
    push({ tabs: [], activeId: undefined })
    expect(port.newTab).toHaveBeenCalledOnce() // first tab on empty entry
  })

  it('TC-15.2.1 — reflects pushed state; address bar drives navigate', () => {
    const { port, push } = makeStub()
    renderBrowser(host, { browser: port })
    push({ tabs: [tab({ id: 7, title: 'Hello Saathi', url: 'https://x.com', canGoBack: true })], activeId: 7 })

    expect(host.querySelector('.br-tab.active .br-tab-t')?.textContent).toBe('Hello Saathi')
    expect(host.querySelector<HTMLInputElement>('#br-address')!.value).toBe('https://x.com')
    expect(host.querySelector<HTMLButtonElement>('#br-back')!.disabled).toBe(false)
    expect(host.querySelector<HTMLButtonElement>('#br-fwd')!.disabled).toBe(true)

    const address = host.querySelector<HTMLInputElement>('#br-address')!
    address.value = 'example.com'
    address.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    expect(port.navigate).toHaveBeenCalledWith(7, 'example.com')
  })

  it('TC-15.2.2 — tab + toolbar controls call the right port methods', () => {
    const { port, push } = makeStub()
    renderBrowser(host, { browser: port })
    push({
      tabs: [tab({ id: 1, title: 'A' }), tab({ id: 2, title: 'B' })],
      activeId: 1,
    })

    host.querySelector<HTMLButtonElement>('#br-newtab')!.click()
    expect(port.newTab).toHaveBeenCalled()

    // activate the 2nd tab, then close it
    const second = host.querySelectorAll('.br-tab')[1]
    second.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    expect(port.activate).toHaveBeenCalledWith(2)
    second.querySelector<HTMLButtonElement>('.br-tab-x')!.click()
    expect(port.closeTab).toHaveBeenCalledWith(2)

    host.querySelector<HTMLButtonElement>('#br-reload')!.click()
    expect(port.reload).toHaveBeenCalledWith(1)
  })

  it('hides the views and cleans up when the pane leaves the DOM', async () => {
    const { port, push } = makeStub()
    renderBrowser(host, { browser: port })
    push({ tabs: [tab({ id: 1 })], activeId: 1 })
    document.body.innerHTML = '' // navigate away
    await new Promise((r) => setTimeout(r, 0)) // let the MutationObserver fire
    expect(port.setVisible).toHaveBeenLastCalledWith(false)
  })
})
