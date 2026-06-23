# BA — 07-office-pdf

## 1. Problem & context
Documents often need to be sent as **PDF**. This completes Office's export set (xlsx/docx/pptx → **pdf**): the Document editor gains a one-click **Download PDF** that writes a real, print-ready `.pdf` locally, via the same adapter pattern (pdf-lib behind a port).

> Scope: PDF **export** of the Doc model. PDF **viewing/ingestion** (PDF.js) belongs with the Knowledge/RAG milestone and is out of scope here.

## 2. Users & jobs-to-be-done
- Primary: anyone sharing a document. Job: "When my document is ready, I want a clean PDF I can email."

## 3. User stories
- **US-1**: As a user, in the Document editor I can click **Download PDF**.
- **US-2**: As a user, the PDF preserves my headings and paragraphs and opens in any PDF reader.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the Docs editor THEN a "Download PDF" control is present and wired to the bridge. *(→ TC-07.2.2, TC-07.3.1)*
- **AC-2** (US-2): GIVEN a document WHEN exported THEN a valid `.pdf` (`%PDF` header) is produced that contains the heading text and is multi-line laid out (word-wrapped). *(→ TC-07.2.1)*

## 5. Scope
- **In**: a `PdfExportPort` + a **pdf-lib** adapter that renders `DocData` (h1/h2/p) to a paginated, word-wrapped A4 PDF (`@saathi/backend`); a **Download PDF** button on the Docs editor (`@saathi/frontend`); `doc:exportPdf` IPC + host Save.
- **Out**: PDF viewing/import (Knowledge milestone); Sheets/Slides → PDF (later); fonts/colours/images in the PDF beyond brand ink + Helvetica.

## 6. Success metrics / done-signal
From the Document editor, one click writes a real, readable `.pdf` with the doc's headings and paragraphs, word-wrapped and paginated.

## 7. Open questions
- None. Sheets/Slides PDF and a PDF viewer are tracked for later slices.
