# DEV — 03-office-docs

## 1. Approach
Mirror M2. **Pure DocData** model in `@saathi/domain` (blocks + inline runs) with `docToHtml` (pure string) and `docPlainText`. `@saathi/frontend` renders the HTML into a contenteditable page, formats with `document.execCommand`, and serializes the page back to DocData (`htmlToDoc`) on download. `@saathi/backend` wraps the **`docx`** library behind `DocExportPort`. `@saathi/desktop` adds `doc:exportDocx` + a Save dialog. Office gains a tiny **Sheets/Docs switcher**.

## 2. Ports touched
- **Outbound**: `DocExportPort { toDocx(doc: DocData): Promise<Uint8Array> }` (`@saathi/backend/ports`), implemented by the docx adapter.
- **IPC**: `doc:exportDocx` (renderer → main): payload = `DocData`; main writes the file via Save dialog.

## 3. Domain model (`@saathi/domain`)
- `Mark = 'bold' | 'italic' | 'underline'`; `Run = { text: string; marks?: Mark[] }`; `Block = { type: 'h1'|'h2'|'p'; runs: Run[] }`; `DocData = { blocks: Block[] }`.
- `docToHtml(doc)` → safe HTML string (`<h1>/<h2>/<p>` with `<strong>/<em>/<u>` wrapping, text escaped).
- `docPlainText(doc)` → concatenated text (for assertions/search).

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Space | Why |
|---|---|---|---|---|
| Render doc → HTML | map blocks→runs | O(n) chars | O(n) | single pass, escaped |
| Serialize HTML → DocData | DOM walk (block → inline) | O(n) nodes | O(n) | one pass over the page |
| Export → docx | map blocks→Paragraph/TextRun | O(n) | O(n) | linear |

## 5. Design patterns
- **Value Object** (Run/Block), **Builder** (docx Document), **Adapter** (docx), **Strategy** (block-type → heading level; mark → run flag), **Facade** (editor controller, office switcher).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Vendor types leak? |
|---|---|---|---|
| **docx** | `backend/adapters/docx/docx-export.adapter.ts` | `DocExportPort` | no (DocData in, Uint8Array out) |

`docx` is imported in exactly one file; CI fails on any other import (mirrors the ExcelJS rule).

## 7. Flow / sequence
Switch Office → Docs → `renderDoc` builds a contenteditable page from `docToHtml(sampleDoc())`. Toolbar → `execCommand('bold'|'italic'|'underline'|'formatBlock')`. Download → `htmlToDoc(pageEl)` → `bridge.exportDocx(doc)` → IPC `doc:exportDocx` → main Save dialog → `DocxExport.toDocx(doc)` → write file.

## 8. Error handling
`docToHtml` escapes all text (no injection). Export returns `Result`-style `ExportResult` (reuses M2's). IPC args validated in preload + main (`doc.blocks` is an array).

## 9. Risks & mitigations
- **HTML→model fidelity** → `htmlToDoc` unit-tested (headings, nested marks); unknown tags fall back to paragraph/plain text.
- **docx validity** → integration test unzips the produced file (jszip, test-only) and asserts `word/document.xml` contains the text and a bold run.
- **XSS via doc text** → `docToHtml` escapes `& < >`; unit-tested.

## 10. ADRs
- Reuses ADR-0004 (`@saathi/domain`). No new ADR.
