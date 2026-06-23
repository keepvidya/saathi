# QA — 01-shell-themes

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Off-brand colour / non-copper accent introduced | M | H | Unit brand-lock guard (TC-01.1.2) |
| Token drift from the locked brand source | M | M | Vendored CSS + values mirrored 1:1 |
| Theme doesn't persist / wrong restore | L | M | Unit + e2e relaunch |
| Quick toggle forgets per-base skin | M | L | Unit toggle memory |
| Visual drift from brand | M | M | Visual review (Light/Medium/Dark) |

## 2. Test approach by level
- **Unit**: each of the 10 themes applies its bg/primary; gradient sets `--bg-image`, solid clears it; per-base toggle memory; `themeGallery()` builder output.
- **Integration**: palette button opens/closes the popover; gallery renders 10 swatches grouped; clicking a swatch applies + marks active + persists.
- **E2E**: open gallery, select Nebula (dark gradient), assert dark + persists after relaunch.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 apply any | TC-01.1.1 | TC-01.2.1 | — |
| AC-2 brand lock (copper-only) | TC-01.1.2 | — | — |
| AC-3 toggle memory | TC-01.1.3 | — | — |
| AC-4 persist | — | — | TC-01.3.1 |
| AC-5 gallery | — | TC-01.2.1 | — |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M0 green.
- **Exit (Done)**: all TCs pass; unit coverage ≥90% on new theme code; lint/typecheck/boundary green; code + **visual review** approved; light/dark/gradient screenshots committed.

## 5. Visual review checklist
- [ ] 3 brand swatches (Light/Medium/Dark) render with correct copper-system colours; active marked
- [ ] Light, Medium, Dark all correct; copper is the only accent
- [ ] Rail/brand/topbar read as Keepvidya (ink + copper)
- [ ] Quick toggle + gallery both work; popover closes on outside click
- [ ] Screenshots (light, medium, dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. localStorage keys `kv-skin`, `kv-theme`, `kv-skin-light`, `kv-skin-dark`.
