import { WebContentsView, session, shell, type BrowserWindow } from 'electron'
import { TabSet, parseAddress } from '@saathi/domain'
import type { BrowserSnapshot, ViewBounds } from '@saathi/shared'

const HOME = 'about:blank'

/**
 * Multi-tab web host. Each tab is a sandboxed `WebContentsView` attached to the
 * window's contentView; the renderer reports the content-region bounds and we
 * size the active view to fit. The domain `TabSet` is the source of truth for the
 * tab list; this class mirrors it onto real views and pushes snapshots back.
 */
export class BrowserTabs {
  private readonly tabs = new TabSet()
  private readonly views = new Map<number, WebContentsView>()
  private bounds: ViewBounds = { x: 0, y: 0, width: 0, height: 0 }
  private visible = false
  // Web content is isolated from the app in its own session partition.
  private readonly tabSession = session.fromPartition('persist:browser-tabs')

  constructor(
    private readonly win: BrowserWindow,
    private readonly push: (snap: BrowserSnapshot) => void,
  ) {}

  private snapshot(): BrowserSnapshot {
    return { tabs: this.tabs.list(), activeId: this.tabs.activeIdOrUndefined() }
  }
  private emit(): void {
    this.push(this.snapshot())
  }

  newTab(input?: string): BrowserSnapshot {
    const id = this.tabs.open()
    const view = new WebContentsView({
      webPreferences: {
        contextIsolation: true,
        sandbox: true,
        nodeIntegration: false,
        webSecurity: true,
        session: this.tabSession,
      },
    })
    this.views.set(id, view)
    this.win.contentView.addChildView(view)
    this.wire(id, view)
    this.layout()

    const url = input ? parseAddress(input).url : HOME
    void view.webContents.loadURL(url)
    this.tabs.update(id, { url })
    this.emit()
    return this.snapshot()
  }

  private wire(id: number, view: WebContentsView): void {
    const wc = view.webContents
    const sync = (): void => {
      this.tabs.update(id, {
        url: wc.getURL(),
        canGoBack: wc.navigationHistory.canGoBack(),
        canGoForward: wc.navigationHistory.canGoForward(),
      })
      this.emit()
    }
    wc.on('page-title-updated', (_e, title) => {
      this.tabs.update(id, { title })
      this.emit()
    })
    wc.on('did-navigate', sync)
    wc.on('did-navigate-in-page', sync)
    wc.on('did-start-loading', () => {
      this.tabs.update(id, { loading: true })
      this.emit()
    })
    wc.on('did-stop-loading', () => {
      this.tabs.update(id, { loading: false })
      sync()
    })
    // target=_blank / window.open → a new in-app tab, never a popup.
    wc.setWindowOpenHandler(({ url }) => {
      if (/^https?:/i.test(url)) this.newTab(url)
      else if (url) void shell.openExternal(url)
      return { action: 'deny' }
    })
  }

  navigate(id: number, input: string): void {
    const view = this.views.get(id)
    if (!view) return
    const { url } = parseAddress(input)
    void view.webContents.loadURL(url)
  }

  back(id: number): void {
    this.views.get(id)?.webContents.navigationHistory.goBack()
  }
  forward(id: number): void {
    this.views.get(id)?.webContents.navigationHistory.goForward()
  }
  reload(id: number): void {
    this.views.get(id)?.webContents.reload()
  }

  activate(id: number): void {
    this.tabs.activate(id)
    this.layout()
    this.emit()
  }

  close(id: number): void {
    const view = this.views.get(id)
    if (view) {
      this.win.contentView.removeChildView(view)
      view.webContents.close()
      this.views.delete(id)
    }
    this.tabs.close(id)
    if (this.tabs.count() === 0) {
      this.newTab() // never leave the user without a tab
      return
    }
    this.layout()
    this.emit()
  }

  setBounds(rect: ViewBounds): void {
    this.bounds = rect
    this.layout()
  }

  setVisible(visible: boolean): void {
    this.visible = visible
    this.layout()
    this.emit() // on show/hide, let the pane learn the current tab state
  }

  /** Show the active view at the reported bounds; hide every other view. */
  private layout(): void {
    const activeId = this.tabs.activeIdOrUndefined()
    for (const [id, view] of this.views) {
      const show = this.visible && id === activeId
      view.setVisible(show)
      if (show) view.setBounds(this.bounds)
    }
  }
}
