# DEV — 16-browser-shields (M9b)

## 1. Approach
A pure **`Shields`** tally in `@saathi/domain/shields` (`enabled` + `blocked`) plus a bundled **`STARTER_FILTERS`** string (network rules for common ad/tracker domains). The engine — `@ghostery/adblocker-electron` — runs in the **main process** (it hooks Electron `session.webRequest`), so it is wrapped by an **`AdBlock`** module in `desktop/main` (**not** `@saathi/backend`, which forbids electron). `AdBlock` parses the bundled filters once, enables/disables blocking on the tabs' session, and fires a callback per blocked request → `Shields.recordBlocked()` → a (throttled) snapshot push. The browser snapshot gains `shields`; a `browser:toggleShields` command flips it. The toolbar shows a 🛡 badge with the count and toggles on click.

## 2. Ports & seams
- **Host module**: `AdBlock` (`desktop/main/ad-block.ts`) — the only file importing `@ghostery/adblocker-electron`. `enable(session)`, `disable(session)`; ctor takes an `onBlocked` callback.
- **IPC**: `browser:toggleShields` (invoke). Shields state rides the existing `browser:event` push (snapshot `shields: { enabled, blocked }`).

## 3. Domain model
- `Shields`: `isEnabled()`, `setEnabled(b)`, `toggle()→boolean`, `recordBlocked(n=1)` (only counts while enabled), `state(): ShieldsState`.
- `ShieldsState { enabled, blocked }` lives in `@saathi/shared` (IPC DTO); domain imports it. `STARTER_FILTERS` is pure data.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Match a request | O(1)–O(log n) | engine's reverse index; in the vendor |
| recordBlocked / toggle | O(1) | our tally |
| Push coalescing | — | blocks are throttled to ~1 push / 150 ms |

## 5. Design patterns
- **Adapter/Facade** (`AdBlock` over `ElectronBlocker`), **Observer** (request-blocked → tally → push), **State** (`Shields`), **DIP** (domain owns the tally; the host owns the engine).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Notes |
|---|---|---|
| **@ghostery/adblocker-electron** | `desktop/src/main/ad-block.ts` | the only importer; in the **main** process (composition root). Filters come from `@saathi/domain` (`STARTER_FILTERS`), so the **core** engine can verify them in a unit test without electron. |

## 7. Flow / sequence
`BrowserTabs` ctor → `new Shields()` + `new AdBlock(onBlocked)` → `adblock.enable(tabSession)`. A page request matching a filter → engine cancels it → `onBlocked` → `shields.recordBlocked()` → `scheduleEmit()` (throttled snapshot). Toggle → `shields.toggle()` → `adblock.enable/disable(tabSession)` → emit. Snapshot always carries `shields`.

## 8. Error handling
Engine parse failure → blocking simply stays off (Shields shows 0 / disabled); browsing still works. Toggling is idempotent. The throttle coalesces block bursts so a tracker-heavy page doesn't spam IPC.

## 9. Risks & mitigations
- **Engine pulls electron into a pure layer** → it lives in `desktop/main` only; filters live in `@saathi/domain` so the rule set is testable with the core engine (no electron).
- **IPC spam on heavy pages** → block pushes are throttled (~150 ms).
- **Cosmetic-filter preload complexity** → M9b ships **network rules only** (no cosmetic/element-hiding), avoiding content-script injection.
- **Offline** → the starter list is bundled (no download).

## 10. ADRs
No new ADR — consistent with the M9a/main composition-root pattern. (Full auto-updating lists may warrant one later.)
