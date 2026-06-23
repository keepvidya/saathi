# TEST PLAN — 01-shell-themes

- **Plan id**: TP-01
- **Items under test**: `theme/theme.ts` (Light/Medium/Dark, locked tokens, per-base memory), `theme/gallery.ts`, shell theme popover, vendored `theme/keepvidya-theme.css`
- **In scope**: brand-locked theming + picker. **Out**: invented themes, Settings pane, features.
- **Approach**: unit (Vitest/jsdom) + integration (Vitest) + e2e (Playwright-Electron).
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-01.1 — Theme engine (UNIT)

### TC-01.1.1 — Light/Medium/Dark apply their locked tokens
| # | Action | Expected result |
|---|---|---|
| 1 | `THEMES.map(id)` | exactly `['light','medium','dark']` (2 light + 1 dark) |
| 2 | for each, `setSkin(id)` | `data-theme` = id; `--bg` & `--primary` = that theme's locked values |

- **Pass/Fail**: ☐

### TC-01.1.2 — Brand lock (copper-only, no decorative backdrops)
| # | Action | Expected result |
|---|---|---|
| 1 | inspect every theme's `--primary` | is brand copper (`#C0703C` or `#D98E5A`) |
| 2 | inspect every theme for `--bg-image` | undefined (no gradient wallpapers) |
| 3 | compare Medium vs Light | same `--primary`; only bg/surface differ |

- **Pass/Fail**: ☐

### TC-01.1.3 — Quick toggle remembers per-base skin
| # | Action | Expected result |
|---|---|---|
| 1 | `setSkin('dark')` then `toggleTheme()` | light base; default `light` first time |
| 2 | `setSkin('medium')`, `setSkin('dark')`, `toggleTheme()` | returns to `medium` (remembered light) |

- **Pass/Fail**: ☐

---
## Suite TS-01.2 — Gallery (INTEGRATION)

### TC-01.2.1 — Gallery renders 3 brand swatches, applies, marks active, closes
| # | Action | Expected result |
|---|---|---|
| 1 | mount shell; click palette button | popover opens with **3** swatches (light/medium/dark), grouped Light/Dark |
| 2 | click "Dark" | Dark applies (`data-theme=dark`, `--primary`=`#D98E5A`); marked active |
| 3 | click outside | popover closes |

- **Pass/Fail**: ☐

---
## Suite TS-01.3 — Persistence (E2E · Playwright-Electron)

### TC-01.3.1 — Selected theme persists across relaunch
| # | Action | Expected result |
|---|---|---|
| 1 | launch (Light); open gallery; pick Medium then Dark | `data-theme` follows; screenshots saved |
| 2 | close & relaunch | reopens in Dark; `--primary` = `#D98E5A` |

- **Pass/Fail**: ☐

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-01.1.1, TC-01.2.1 |
| AC-2 | TC-01.1.2 |
| AC-3 | TC-01.1.3 |
| AC-4 | TC-01.3.1 |
| AC-5 | TC-01.2.1 |
