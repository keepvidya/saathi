# QA — 16-browser-shields (M9b)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Trackers not actually blocked | M | **H** | filter rules verified vs the engine; e2e block |
| Count wrong / not shown | M | M | `Shields` tally unit + pane badge |
| Toggle doesn't disable blocking | M | M | toggle unit + e2e |
| Legit content blocked (over-block) | L | M | curated list; allow example.com (unit) |
| Engine leaks into a pure layer | L | M | only `desktop/main/ad-block.ts` imports it |

## 2. Test approach by level
- **Unit (domain)**: `Shields` — toggle, `recordBlocked` only while enabled, `state`. `STARTER_FILTERS` — verified with the **core** `@ghostery/adblocker` engine: blocks `doubleclick.net` / `google-analytics.com`, allows `example.com` (proves the rules are real, no electron needed).
- **Integration (frontend)**: the Browser pane shows the 🛡 badge with the pushed count; clicking calls `toggleShields`; the badge reflects enabled/disabled.
- **E2E**: load a `data:` page that references a known tracker → the blocked count becomes ≥1; toggle Shields off → the badge shows the off state.
- **CI hygiene**: `@ghostery/adblocker-electron` is imported only by `ad-block.ts`.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 block | TC-16.1.2 | — | TC-16.3.1 |
| AC-2 count | TC-16.1.1 | TC-16.2.1 | TC-16.3.1 |
| AC-3 toggle | TC-16.1.1 | TC-16.2.2 | TC-16.3.1 |
| AC-4 wrapped | — | — | review/hygiene |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M9a green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90% (global gate); lint/typecheck/boundary green; code + **visual review** (Shields badge + count, on and off, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Shields button + blocked-count badge in the toolbar
- [ ] On vs off visual state (e.g. dimmed when off)
- [ ] Brand tokens light + dark
- [ ] Screenshots (browser-shields light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: `Shields`; `STARTER_FILTERS` + the core engine; a `data:` page referencing `doubleclick.net` for the e2e.
