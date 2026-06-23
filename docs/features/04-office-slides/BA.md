# BA — 04-office-slides

## 1. Problem & context
Completing the Office trio: a **Slides** editor that runs locally — title + bullet slides, multiple slides, and an export that opens in PowerPoint as a real **.pptx**. Same architecture as Sheets/Docs: pure deck model in `@saathi/domain`, a pptxgenjs-wrapped exporter in `@saathi/backend`, the editor in `@saathi/frontend`.

> Scope decision: the **per-type Expert-Agent "AI build"** is a separate functionality (its own slice) — it will generate slide/sheet/doc *content* into these editors. M4 ships the Slides **engine + editor + export**; agents come next.

## 2. Users & jobs-to-be-done
- Primary: anyone making a deck (a pitch, a class, an update). Job: "When I put a title and points on slides, I want a real .pptx I can present and send."

## 3. User stories
- **US-1**: As a user, I want a slide with an editable title and bullet points.
- **US-2**: As a user, I want multiple slides and to switch between them (and add a slide).
- **US-3**: As a user, I want to pick Slides inside Office (alongside Sheets and Docs).
- **US-4**: As a user, I want to download a real **.pptx** with my slides' titles and bullets intact.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the Slides editor THEN the active slide shows an editable title and bullet list from the model. *(→ TC-04.2.2, TC-04.3.1)*
- **AC-2** (US-2): GIVEN a deck with N slides WHEN I click a thumbnail THEN that slide becomes active; "+ Slide" adds a new slide. *(→ TC-04.2.2)*
- **AC-3** (US-3): GIVEN Office WHEN I switch to "Slides" THEN the deck editor shows; Sheets/Docs still work. *(→ TC-04.2.3, TC-04.3.1)*
- **AC-4** (US-4): GIVEN a deck WHEN exported THEN a valid `.pptx` is produced whose slide XML contains the slide titles and bullet text. *(→ TC-04.2.1)*

## 5. Scope
- **In**: a pure **DeckData** model (deck title + slides of {title, bullets}) + helpers (`@saathi/domain`); a **.pptx export** adapter via `pptxgenjs` behind a port (`@saathi/backend`); a slides editor (canvas + slide strip + add) and the Office **Sheets/Docs/Slides** switcher (`@saathi/frontend`); `slide:exportPptx` IPC + host Save.
- **Out**: per-slide layouts/themes beyond title+bullets, images/charts/tables on slides, transitions, present mode, .pptx *import* (later). The Expert-Agent build (next slice).

## 6. Success metrics / done-signal
Edit titles/bullets across multiple slides, switch Office to Slides, and one click writes a real `.pptx` that opens in PowerPoint with the content intact. Model pure + tested.

## 7. Open questions
- None. A richer slide canvas (shapes/images) and templates arrive with the Expert-Agent slice and later polish.
