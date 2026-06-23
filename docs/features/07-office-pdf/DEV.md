# DEV — 07-office-pdf

## 1. Approach
Mirror the export slices. `@saathi/backend` wraps **pdf-lib** behind a new `PdfExportPort`; the adapter lays out `DocData` onto A4 pages — headings (Helvetica-Bold) and paragraphs (Helvetica), word-wrapped to the text width, paginating when the cursor runs off the page, in brand ink. Text is sanitised to the font's encoding. `@saathi/frontend` adds a **Download PDF** button to the Docs editor → `bridge.exportPdf` → `doc:exportPdf` IPC → host Save. No domain change (reuses `DocData`).

## 2. Ports touched
- **Outbound**: `PdfExportPort { toPdf(doc: DocData): Promise<Uint8Array> }` (`@saathi/backend/ports`), implemented by the pdf-lib adapter.
- **IPC**: `doc:exportPdf` (renderer → main): payload = `DocData`.

## 3. Model
Reuses `DocData`. Layout constants: A4 (595×842pt), 56pt margins; sizes h1=22 / h2=15 / p=11; line height 1.5×.

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Word-wrap a block | O(w) words | greedy fill, measure via `font.widthOfTextAtSize` |
| Export doc | O(n) chars | one pass over blocks → lines → pages |

## 5. Design patterns
- **Adapter** (pdf-lib), **Builder** (PDFDocument/pages), **Strategy** (block type → font/size), **Facade** (editor download).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Vendor types leak? |
|---|---|---|---|
| **pdf-lib** | `backend/adapters/pdf-lib/pdf-export.adapter.ts` | `PdfExportPort` | no (DocData in, Uint8Array out) |

pdf-lib imported in exactly one file; the `vendor-only-in-adapter` rule extends to cover it.

## 7. Flow / sequence
Docs editor → **Download PDF** → `bridge.exportPdf(htmlToDoc(page))` → IPC `doc:exportPdf` → main Save dialog → `PdfLibDocExport.toPdf(doc)` → write file.

## 8. Error handling
Text sanitised (em-dash→`-`, curly quotes→straight, drop non-encodable) to avoid font-encoding throws. Export returns `ExportResult`. IPC validates `doc.blocks` is an array.

## 9. Risks & mitigations
- **Invalid PDF / lost text** → integration test asserts `%PDF` header + the heading text present in the bytes + non-trivial size.
- **Font-encoding crash on odd chars** → sanitiser unit-covered by exporting the sample (which has an em-dash).
- **Text overflow** → word-wrap + pagination.

## 10. ADRs
Reuses ADR-0004. No new ADR.
