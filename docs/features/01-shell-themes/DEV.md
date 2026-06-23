# DEV — 01-shell-themes

## 1. Approach
Extend the M0 theme engine (frontend package only — no backend/electron). Set `THEMES` to the **brand-locked Light/Medium/Dark** only, with each theme's full semantic token set copied verbatim from the brand source of truth (vendored as `theme/keepvidya-theme.css`). Add per-base remembered skin for the quick toggle, a `themeGallery()` view-model, and a topbar popover that applies on click. Export `COPPER_ACCENTS` so a unit test can guard the "copper is the only accent" rule. Pure UI/data; no new dependency. **No invented colours, no gradient backdrops.**

## 2. Ports touched
None (frontend-internal). No IPC change.

## 3. Domain model
`Theme { id, name, base, vars, sw:[bg,surface,accent] }` for `light` · `medium` · `dark`. `vars` is the complete locked token set applied inline (deterministic, testable). `sw` is the swatch preview triple. No `grad`/`--bg-image` — the brand has no decorative backdrops.

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Space | Why |
|---|---|---|---|---|
| Lookup theme by id | `THEMES.find` (n=10) | O(n) | O(1) | n tiny; linear is clearest. (Map cache available if n grows) |
| Apply skin | set ≤17 CSS vars | O(v) | O(1) | clears `SKINVARS` then sets theme vars |
| Render gallery | map over THEMES | O(n) | O(n) | builds swatch DOM once per open |

## 5. Design patterns
- **Strategy/Registry** — themes as data; engine applies any.
- **Observer** — applying a skin repaints the toggle icon + gallery active marker.
- **Popover/Facade** — `mountThemeGallery()` encapsulates open/close + outside-click.

## 6. External modules (Wrapper Rule)
None — no vendor libraries in this slice.

## 7. Flow / sequence
Topbar palette button → toggle popover → render `themeGallery()` swatches → click swatch → `setSkin(id)` (applies vars + persists `kv-skin`, `kv-skin-<base>`) → repaint active marker + toggle icon. Quick toggle → `toggleTheme()` → remembered opposite-base skin.

## 8. Error handling
`localStorage` access stays wrapped (try/catch) from M0. Unknown id → falls back to `paper`. Outside-click/escape close the popover.

## 9. Risks & mitigations
- **Off-brand colour creep** → `TC-01.1.2` asserts every theme's `--primary` is brand copper and no `--bg-image`; values vendored from the locked brand file.
- **Token drift from the brand source** → `keepvidya-theme.css` vendored in-repo + cited; theme.ts mirrors it 1:1.
- **Per-base memory wrong default** → unit test for first-time defaults (light/dark).
- **Visual drift** → visual review with Light + Medium + Dark screenshots.

## 10. ADRs
None new (extends ADR-0002/0003 within the frontend package).
