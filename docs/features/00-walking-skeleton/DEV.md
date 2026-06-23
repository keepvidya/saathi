# DEV — 00-walking-skeleton

## 1. Approach
Scaffold with `electron-vite` (main/preload/renderer). Main owns the window with the **security baseline**; preload exposes a **typed, minimal** `window.saathi` via `contextBridge` (one method per channel). The renderer is pure UI: a **shell** (rail + topbar + body), a **pane router** (registry of `PaneId → render(el)`), and a **theme** module (CSS tokens + `setSkin` + persistence). The renderer touches the platform only through `renderer/src/bridge/` which wraps `window.saathi`.

## 2. Ports touched
- This slice has no domain engine yet. The cross-process boundary is treated as a port: **`AppInfoPort`** (inbound to renderer) implemented by the preload/main IPC. Future outbound ports (Llm, Export, …) are introduced in their slices.

## 3. Domain model
None yet (skeleton). `shared/result.ts` (`Result<T,E>`) and `shared/ids.ts` introduced for later reuse.

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Space | Why |
|---|---|---|---|---|
| Resolve pane by id | `Map<PaneId, Pane>` | O(1) | O(n panes) | constant-time route lookup; n is tiny but Map keeps it O(1) and typo-safe |
| Apply theme | set N CSS vars on `:root` | O(v) v=vars | O(1) | direct `style.setProperty`; clears prior skin vars first |

## 5. Design patterns
- **Facade** — `bridge/` hides IPC behind a small renderer-friendly API.
- **Registry/Strategy** — pane router: each pane is a `render(el)` strategy registered by id.
- **Observer** — theme change notifies the rail (active button + icon) via a tiny emitter.
- **Module boundary** — renderer never imports `electron`; only `window.saathi`.

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Vendor types leak? |
|---|---|---|---|
| Electron `app`/IPC | `main/ipc/*` + `preload/index.ts` + `renderer/src/bridge/saathi.bridge.ts` | `AppInfoPort` | no (renderer sees only our `AppInfo` type) |
| electron-updater | *(deferred to M11)* | `UpdatePort` | n/a yet |

## 7. Flow / sequence
`renderer boot → mountShell(#app) → themeInit() → router.show(default) →` user clicks rail → `router.show(id)` re-renders body. For app info: `bridge.getAppInfo() → window.saathi.app.getInfo() → ipcRenderer.invoke('app:getInfo') → main handler (validates) → AppInfo`.

## 8. Error handling
`Result<T,E>` for fallible calls. IPC args validated in **preload** and **again in main**. Theme persistence wrapped in try/catch (localStorage may throw). No silent failures — errors logged via a `LogPort` console adapter.

## 9. Risks & mitigations
- **Security misconfig** → assert the baseline in code + an integration test on `webPreferences`.
- **Theme flash on boot** → inline pre-paint script sets `data-theme` from storage before first paint.
- **Router typos** → `PaneId` union type; Map lookup; unit test covers unknown id.

## 10. ADRs
- [ADR-0002](../../adr/0002-stack-electron-vite-vanilla-ts.md) — stack choice.
