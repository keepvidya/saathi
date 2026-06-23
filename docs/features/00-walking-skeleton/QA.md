# QA — 00-walking-skeleton

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Electron security misconfigured (nodeIntegration on / no contextIsolation) | M | H | Integration test asserts `webPreferences`; preload exposes only `saathi` |
| Theme doesn't persist / flashes | M | M | Unit (setSkin/persist) + e2e (toggle + relaunch) |
| Router shows wrong/blank pane | L | M | Unit (resolve) + e2e (click → content) |
| Renderer can reach Node/IPC raw | L | H | Unit: `window.saathi` shape; assert no `require`/`ipcRenderer` |

## 2. Test approach by level
- **Unit (Vitest, jsdom)**: `theme.setSkin` (vars applied/cleared, persistence), `router.resolve/show`, `bridge` shape, `Result`.
- **Integration (Vitest)**: shell mount wiring (rail click → router renders pane); preload API contract object shape (one method per channel, no raw ipc).
- **E2E (Playwright-Electron)**: real app launch → rail visible → switch pane → toggle theme → relaunch persists.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 rail+default | — | TC-00.2.2 | TC-00.3.1 |
| AC-2 navigate | TC-00.1.2 | TC-00.2.2 | TC-00.3.2 |
| AC-3 theme+persist | TC-00.1.1 | — | TC-00.3.3 |
| AC-4 secure bridge | TC-00.1.3 | TC-00.2.1 | — |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; deps installed; configs in place.
- **Exit (Done)**: all TCs pass; unit coverage ≥90% on new `theme`/`router`/`bridge`/`result`; lint+typecheck+boundary green; code review + **visual review** approved; snapshots stored.

## 5. Visual review checklist
- [ ] Rail collapsed by default, expands; brand + 9 nav + Settings pinned bottom
- [ ] Default pane (Chat) renders; active item highlighted
- [ ] Light + dark correct (screenshots attached)
- [ ] Brand tokens (copper/ink/paper, Source Serif/Sans) correct
- [ ] No console errors; min-width usable
- [ ] Visual-regression snapshot committed

## 6. Test environment & data
Windows 11, Node 22, Electron 33, dev build. No external data. localStorage key `kv-skin`.
