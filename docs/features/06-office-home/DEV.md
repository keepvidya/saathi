# DEV — 06-office-home

## 1. Approach
Frontend-only. Split `renderOffice` into two views behind an `officeView: 'home' | 'editor'` state: **`renderHome`** (hero + `Create new` cards + `Templates` + `Recent`) and the existing **editor view** (Sheets/Docs/Slides switcher + AI-build bar) gaining a `← Office` back button. Picking a card/template/recent sets the active kind, pushes a Recent entry, and switches to the editor. No domain/backend/IPC change; the editors (M2–M4b) are reused as-is.

## 2. Ports touched
None (UI routing only).

## 3. Model
- `OfficeKind = 'sheets'|'docs'|'slides'`. `TYPES` (kind → label/blurb/icon), `TEMPLATES` (kind → name/desc), `recent: RecentItem[]` (module-level, in-session). `RecentItem { kind, name }`.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Render home | O(t+r) | map over a few cards/templates/recents |
| Route to editor | O(1) | set view+kind, re-render |
| Push recent | O(1) amortised | dedupe by name, cap to ~6 |

## 5. Design patterns
- **State machine** (home/editor view), **Strategy** (kind → editor), **Facade** (`renderOffice` orchestrates), **Observer** (clicks → re-render).

## 6. External modules (Wrapper Rule)
None.

## 7. Flow / sequence
`renderOffice` → if `officeView==='home'` → `renderHome` (cards/templates/recent); a card click → `openEditor(kind)` (sets kind, `recordRecent`, `officeView='editor'`, re-render). Editor view → existing switcher + AI build; `← Office` → `officeView='home'`, re-render.

## 8. Error handling
Unknown kinds ignored. Recent capped + deduped. No persistence (in-session array) — documented.

## 9. Risks & mitigations
- **Regressing M2–M4b** → integration + e2e exercise the switcher, AI build, and exports from within the new routing.
- **Recent state leaking oddly** → dedupe + cap; reset on each session (module load).

## 10. ADRs
None.
