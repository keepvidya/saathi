# QA — 20-settings (M11a)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Key readable by renderer | L | **H** (DNA) | no `secret:get`; bridge has no get |
| Key stored in plaintext | M | **H** | safeStorage encrypt; raw fallback flagged |
| Settings lost on restart | L | M | JSON persistence unit |
| Wrong field saved | M | M | `JsonSettings.set` merge unit + pane integration |

## 2. Test approach by level
- **Unit (backend)**: `JsonSettings` — defaults on first run; `set` merges a patch; persistence on a new instance; corrupt file → defaults.
- **Integration (frontend)**: Settings pane (injected ports) — loads settings + key presence; changing name/provider calls `settings.set`; saving a key calls `secrets.set` and flips the field to "set"; clearing calls `secrets.clear`.
- **E2E**: open Settings → set name → save a key → presence shows "set" → clear → gone (set/has/clear contract; encryption is OS-backed).

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 name/theme | TC-20.1.1 | TC-20.2.1 | TC-20.3.1 |
| AC-2 provider | TC-20.1.1 | TC-20.2.1 | — |
| AC-3 encrypted key | — | TC-20.2.2 | TC-20.3.1 |
| AC-4 persist | TC-20.1.1 | — | — |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M10c green.
- **Exit (Done)**: all TCs pass; backend coverage ≥90% (global gate); lint/typecheck/boundary green; code + **visual review** (Settings sections, key "set" state, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Profile (name), AI provider (offline/cloud + key), Search (provider + key), Appearance (theme), About
- [ ] Key shown only as "set ✓" with replace/remove — never the value
- [ ] Brand tokens light + dark; screenshots committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: a temp settings JSON; injected settings/secrets stubs for the pane.
