# DEV — 04-office-slides

## 1. Approach
Mirror M2/M3. **Pure DeckData** in `@saathi/domain` (deck title + slides of `{title, bullets[]}`) with `deckPlainText` + `sampleDeck`. `@saathi/frontend` renders the active slide as an editable canvas (title + bullets) with a slide strip to switch/add, and serializes edits back into the deck. `@saathi/backend` wraps **`pptxgenjs`** behind `DeckExportPort`. `@saathi/desktop` adds `slide:exportPptx` + Save. Office switcher gains a **Slides** tab.

## 2. Ports touched
- **Outbound**: `DeckExportPort { toPptx(deck: DeckData): Promise<Uint8Array> }` (`@saathi/backend/ports`), implemented by the pptxgenjs adapter.
- **IPC**: `slide:exportPptx` (renderer → main): payload = `DeckData`.

## 3. Domain model (`@saathi/domain`)
- `Slide = { title: string; bullets: string[] }`; `DeckData = { title: string; slides: Slide[] }`.
- `deckPlainText(deck)` → all titles + bullets (assertions/search). `sampleDeck()` → a 3-slide investor deck.

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Space | Why |
|---|---|---|---|---|
| Render slide | array map (bullets) | O(b) | O(b) | one slide at a time |
| Switch slide | index assignment | O(1) | O(1) | active index |
| Export → pptx | map slides→pptx slides | O(n·b) | O(n·b) | linear over content |

## 5. Design patterns
- **Value Object** (Slide), **Adapter** (pptxgenjs), **Facade** (slides controller, office switcher), **Strategy** (Office tab → editor).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Vendor types leak? |
|---|---|---|---|
| **pptxgenjs** | `backend/adapters/pptxgenjs/pptx-export.adapter.ts` | `DeckExportPort` | no (DeckData in, Uint8Array out) |

`pptxgenjs` imported in exactly one file; CI fails on any other import (the `vendor-only-in-adapter` rule extends to cover it).

## 7. Flow / sequence
Office → Slides → `renderSlides` shows `sampleDeck()`; active slide title+bullets are contenteditable; editing updates `deck.slides[active]`; the strip switches/adds slides. Download → `bridge.exportPptx(deck)` → IPC → main Save dialog → `PptxDeckExport.toPptx(deck)` → write.

## 8. Error handling
Empty titles/bullets allowed (skipped or rendered blank). Export returns `ExportResult`. IPC args validated (`deck.slides` is an array) in preload + main.

## 9. Risks & mitigations
- **pptx validity / content loss** → integration test unzips the produced `.pptx` (jszip) and asserts a slide's XML contains the title + a bullet.
- **Editor ↔ model drift** → serialize on edit; integration test checks edit → model → export path.
- **Office regression (Sheets/Docs)** → switcher integration + e2e exercise all three.

## 10. ADRs
- Reuses ADR-0004 (`@saathi/domain`). No new ADR.
