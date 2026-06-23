# BA — 03-office-docs

## 1. Problem & context
After Sheets, users need a **Word-style document** that runs locally: headings + paragraphs, basic rich text (bold/italic/underline), and an export that opens perfectly in Word as a real **.docx**. Built on the same architecture as M2 — pure document model in `@saathi/domain`, a vendor-wrapped exporter in `@saathi/backend`, the editor in `@saathi/frontend`.

## 2. Users & jobs-to-be-done
- Primary: anyone writing a letter, proposal, or report. Job: "When I write and format text, I want it to look right and save a real .docx I can send."

## 3. User stories
- **US-1**: As a user, I want to type into a document page with headings and paragraphs.
- **US-2**: As a user, I want **bold / italic / underline** and heading styles via a toolbar.
- **US-3**: As a user, I want to switch between **Sheets** and **Docs** inside Office.
- **US-4**: As a user, I want to download a real **.docx** that opens in Word with my text and formatting intact.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the Docs editor THEN it renders a document with an H1 and paragraphs from the model. *(→ TC-03.2.2, TC-03.3.1)*
- **AC-2** (US-2): GIVEN selected text WHEN I click Bold/Italic/Underline THEN the selection becomes bold/italic/underlined; heading buttons set H1/H2/P. *(→ TC-03.3.2 visual)*
- **AC-3** (US-3): GIVEN Office WHEN I switch to "Docs" THEN the document editor shows; switching to "Sheets" shows the grid. *(→ TC-03.2.3, TC-03.3.1)*
- **AC-4** (US-4): GIVEN a document with a heading + a **bold** run WHEN exported THEN a valid `.docx` is produced whose `word/document.xml` contains that text and marks the run bold. *(→ TC-03.2.1)*

## 5. Scope
- **In**: a pure **DocData** model (blocks = h1/h2/p, inline runs with bold/italic/underline) + `docToHtml`/`docPlainText` (`@saathi/domain`); a **.docx export** adapter via the `docx` lib behind a port (`@saathi/backend`); a Word-style contenteditable editor + toolbar + an Office **Sheets/Docs switcher** (`@saathi/frontend`); `doc:exportDocx` IPC + host Save.
- **Out**: tables, images, lists, page layout/headers/footers, .docx *import*, fonts/colours (later slices). PPT/PDF are later milestones.

## 6. Success metrics / done-signal
Type + format text in a page, switch between Sheets/Docs, and one click writes a real `.docx` that opens in Word with the heading and bold run intact. The model is pure and tested.

## 7. Open questions
- None. The editor uses `document.execCommand` for inline marks (pragmatic, well-supported); a richer engine (TipTap) is a later swap behind the same model.
