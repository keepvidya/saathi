# DEV — 15-browser (M9a)

## 1. Approach
Two pure pieces in `@saathi/domain/browser`: **`parseAddress`** (URL vs search → a concrete URL) and **`TabSet`** (the tab list/active-tab state machine). The renderer's Browser pane is thin: a tab strip + toolbar + address bar + a **content region** (an empty div). Real web content runs in the **main process** as one **`WebContentsView`** per tab, attached to the window's `contentView`; the renderer reports the content region's pixel **bounds** and main sizes the active view to fit. Tab actions are typed IPC (`invoke`); page state flows back as a main→renderer **event channel** (the first push-style IPC in the app — a small, allow-listed `onBrowserEvent`). Pane lifecycle: on mount the pane shows + sizes the active view; when the pane leaves the DOM it hides the views (detected like the Mermaid observer).

## 2. Ports & seams
- **IPC (renderer→main, invoke)**: `browser:newTab(url?)→TabState[]`, `browser:closeTab(id)`, `browser:activate(id)`, `browser:navigate(id,input)`, `browser:back(id)`, `browser:forward(id)`, `browser:reload(id)`, `browser:setBounds(rect)`, `browser:setVisible(bool)`.
- **IPC (main→renderer, push)**: `browser:event` → `{ tabs: TabState[], activeId }` (sent on any tab/nav change). `TabState { id, title, url, loading, canGoBack, canGoForward }` lives in `@saathi/shared`.
- Preload exposes `browser.*` invokers + `browser.onEvent(cb)` (wraps `ipcRenderer.on`, returns an unsubscribe).

## 3. Domain model
- `parseAddress(input, searchUrl?) → { kind:'url'|'search', url }`: explicit scheme → as-is; `localhost`/IP/`host.tld` with no spaces → prefix `https://`; otherwise → `searchUrl + encodeURIComponent(input)` (default DuckDuckGo). Empty → `about:blank`.
- `TabSet`: `open(url)→id`, `activate(id)`, `close(id)`, `update(id, patch)`, `active()`, `list()`, `count()`. Closing the active tab activates the right-then-left neighbour; ids from a counter.

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time |
|---|---|---|
| open / activate / update | array + activeId | O(1)/O(n) |
| close (reactivate neighbour) | array | O(n) |
| parseAddress | regex tests | O(1) |

## 5. Design patterns
- **State machine** (`TabSet`), **Strategy** (search engine via `searchUrl`), **Adapter/Facade** (main `BrowserTabs` over Electron `WebContentsView`), **Observer** (push events; pane self-hides when detached), **DIP** (renderer depends on the IPC contract, not Electron).

## 6. External modules (Wrapper Rule)
None new in M9a — `WebContentsView`/`session` are Electron, used only in the **main process** (the composition root), behind the IPC contract. (M9b adds `@ghostery/adblocker-electron` behind an `AdBlockPort`.)

## 7. Flow / sequence
Address enter → `browser:navigate(activeId, input)` → main `parseAddress` is **not** re-done in main (the renderer passes the raw input; main calls the domain `parseAddress` to resolve) → `view.webContents.loadURL(url)`. `did-navigate`/`page-title-updated`/`did-start/stop-loading` → main rebuilds `TabState[]` → `browser:event`. Pane mount → measure region → `setBounds` + `setVisible(true)`; ResizeObserver + window resize keep bounds current; region detached → `setVisible(false)`.

## 8. Error handling
Bad URL → `loadURL` failure → `did-fail-load` shows an in-view error (Electron default) and a stable address. Closing the last tab opens a fresh blank tab (never zero). IPC validates ids/strings. Navigating a missing tab id is a no-op.

## 9. Security (baseline preserved)
Each `WebContentsView`: `contextIsolation:true`, `sandbox:true`, `nodeIntegration:false`, no preload, its own `session` partition. `setWindowOpenHandler` → open as a new tab (deny popups). The app renderer keeps its strict CSP; web content is a separate, sandboxed `webContents` (not governed by the app CSP). No remote module.

## 10. ADRs
No new ADR (WebContentsView is the Electron-recommended embed; consistent with the security baseline). M9b's ad-block engine may get one.
