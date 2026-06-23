# TEST PLAN — 00-walking-skeleton

- **Plan id**: TP-00
- **Items under test**: `theme/`, `shell/router`, `bridge/`, `shared/result`, Electron `webPreferences`, app launch
- **In scope**: boot, navigation, theming, secure bridge. **Out**: features/engines.
- **Approach**: unit (Vitest/jsdom) + integration (Vitest) + e2e (Playwright-Electron).
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-00.1 — Core logic (UNIT)

### TC-00.1.1 — Theme applies, clears, and persists
- **Preconditions**: jsdom; `localStorage` empty.

| # | Action | Expected result |
|---|---|---|
| 1 | `setSkin('paper')` | `documentElement[data-theme]==='light'`; `--bg` = paper token |
| 2 | `setSkin('midnight')` | `data-theme==='dark'`; `--bg` = midnight token; prior skin vars replaced |
| 3 | read `localStorage['kv-skin']` | equals `'midnight'` |
| 4 | `loadSkin()` (simulate relaunch) | applies `'midnight'` from storage |

- **Pass/Fail**: ☐

### TC-00.1.2 — Router resolves and renders panes
| # | Action | Expected result |
|---|---|---|
| 1 | `router.resolve('office')` | returns the Office pane object |
| 2 | `router.resolve('nope' as PaneId)` | returns `undefined` (no throw) |
| 3 | `router.show('office', el)` | `el` contains Office pane content; `active==='office'` |

- **Pass/Fail**: ☐

### TC-00.1.3 — Bridge shape is minimal & safe
| # | Action | Expected result |
|---|---|---|
| 1 | inspect `bridge` API surface | exposes `getAppInfo()` only (and future-namespaced methods); no `ipcRenderer`, no `require` |
| 2 | call `getAppInfo()` (mock) | resolves to `{name,version,platform}` typed `AppInfo` |

- **Pass/Fail**: ☐

---
## Suite TS-00.2 — Wiring & security (INTEGRATION)

### TC-00.2.1 — Secure webPreferences
| # | Action | Expected result |
|---|---|---|
| 1 | read window factory config | `contextIsolation:true`, `sandbox:true`, `nodeIntegration:false`, `webSecurity:true` |
| 2 | read preload exposure map | exactly one IPC channel per exposed method; none expose raw `ipcRenderer` |

- **Pass/Fail**: ☐

### TC-00.2.2 — Shell mount wires rail → router
| # | Action | Expected result |
|---|---|---|
| 1 | `mountShell(container)` | rail + topbar + body present; default pane (chat) rendered |
| 2 | dispatch click on the "office" rail button | body shows Office pane; office button has `active` class |

- **Pass/Fail**: ☐

---
## Suite TS-00.3 — App flows (E2E · Playwright-Electron)

### TC-00.3.1 — Launch shows branded shell
| # | Action | Expected result |
|---|---|---|
| 1 | launch app | window visible; rail rendered; brand "Saathi" present; Chat pane shown |

- **Pass/Fail**: ☐

### TC-00.3.2 — Navigate panes
| # | Action | Expected result |
|---|---|---|
| 1 | click "Office" in rail | Office pane content visible; item active |
| 2 | click "Settings" | Settings pane visible |

- **Pass/Fail**: ☐

### TC-00.3.3 — Theme toggle persists across relaunch
| # | Action | Expected result |
|---|---|---|
| 1 | click theme toggle (from light) | `data-theme==='dark'`; visuals update |
| 2 | close & relaunch app | app opens in dark (persisted) |

- **Pass/Fail**: ☐

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-00.2.2, TC-00.3.1 |
| AC-2 | TC-00.1.2, TC-00.2.2, TC-00.3.2 |
| AC-3 | TC-00.1.1, TC-00.3.3 |
| AC-4 | TC-00.1.3, TC-00.2.1 |
