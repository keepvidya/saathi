# BA — 06-office-home

## 1. Problem & context
Opening Office drops the user straight into an editor. They asked (from their Keepvidya-Office app) for a **staged launchpad**: pick what to make, start from a **template**, or reopen a **recent** file — then land in the editor. This fuses that layout on our brand, in front of the existing Sheets/Docs/Slides editors + AI build.

## 2. Users & jobs-to-be-done
- Primary: anyone opening Office. Job: "When I open Office, I want to choose what to create or pick up where I left off — not stare at a blank document."

## 3. User stories
- **US-1**: As a user, I see **Create new** cards (Spreadsheet / Document / Presentation) and clicking one opens that editor.
- **US-2**: As a user, I see **Templates** (e.g. Monthly budget, Business letter, Pitch deck) and clicking one opens the right editor.
- **US-3**: As a user, I see **Recent** files I made this session and can reopen them.
- **US-4**: As a user, I can go **back to the home** from an editor.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the Office home WHEN I click a Create-new card THEN the matching editor opens (Sheets/Docs/Slides). *(→ TC-06.1.1, TC-06.2.1)*
- **AC-2** (US-2): GIVEN a Template card WHEN I click it THEN the right editor opens for that type. *(→ TC-06.1.2)*
- **AC-3** (US-3): GIVEN I created/opened something this session THEN it appears under Recent and reopens on click. *(→ TC-06.1.3)*
- **AC-4** (US-4): GIVEN an open editor WHEN I click "← Office" THEN the home shows again; the Sheets/Docs/Slides switcher + AI build still work. *(→ TC-06.1.4, TC-06.2.1)*

## 5. Scope
- **In**: a staged Office **home** view (hero + local badge + Create-new cards + Templates + Recent) and routing (home ↔ editor) with a back control; recent tracked in-session; all in `@saathi/frontend`. The editors + AI build (M2–M4b) are reused unchanged.
- **Out**: PDF (next slice); persistent recent across launches; per-template starter content beyond the existing samples; a separate file-name/save model.

## 6. Success metrics / done-signal
Open Office → a branded launchpad; pick a type or template or recent → the right editor; back returns home; everything from M2–M4b still works.

## 7. Open questions
- None. Recent is in-session for now; persistence arrives with a files/store milestone.
