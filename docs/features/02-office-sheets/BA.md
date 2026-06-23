# BA — 02-office-sheets

## 1. Problem & context
Office workers and students need a **real spreadsheet** that runs locally: editable cells, working **formulas**, a frozen header, and an export that opens perfectly in Excel. This is Saathi's first real engine and the reference for the whole architecture (pure domain engine + a vendor-wrapped exporter + UI). The engine computes the truth; the LLM only narrates later.

## 2. Users & jobs-to-be-done
- Primary: anyone tracking numbers (a budget, a small dataset). Job: "When I put numbers in a grid, I want totals and calculations to be correct and to save a real .xlsx."

## 3. User stories
- **US-1**: As a user, I want to type values into a grid of cells, so I can enter data.
- **US-2**: As a user, I want to write formulas (`=SUM(B2:D2)`, `=B2-B3`, `=AVERAGE(...)`), so totals compute automatically and update when inputs change.
- **US-3**: As a user, I want the header row to stay visible (frozen) while I scroll.
- **US-4**: As a user, I want to download a real **.xlsx** that opens in Excel with my data (and formulas) intact.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a sheet WHEN I set `A1="Item"`, `B2="120"` THEN those display as entered. *(→ TC-02.1.x, TC-02.3.1)*
- **AC-2** (US-2): GIVEN `B2=120,C2=150,D2=177` WHEN `E2="=SUM(B2:D2)"` THEN `E2` displays `447`; WHEN I change `B2` to `100` THEN `E2` recomputes to `427`. Supports `+ - * / ()`, cell refs, ranges, and `SUM/AVERAGE/MIN/MAX/COUNT`; bad refs/cycles yield a clean error (`#ERR`/`#CIRC`), never a crash or a wrong number. *(→ TC-02.1.x, TC-02.3.2)*
- **AC-3** (US-3): GIVEN a tall sheet WHEN I scroll THEN row 1 (header) stays pinned. *(→ TC-02.2.x visual)*
- **AC-4** (US-4): GIVEN a sheet with values + a `SUM` formula WHEN exported THEN a valid `.xlsx` is produced whose cells hold the values and whose total cell equals the computed result. *(→ TC-02.2.1)*

## 5. Scope
- **In**: pure **formula engine** + sheet model (`@saathi/domain`); editable grid + formula bar + frozen header (`@saathi/frontend`); **.xlsx export** via an **ExcelJS adapter** behind a port (`@saathi/backend`), wired over IPC and saved via the host.
- **Out**: Univer canvas editor (later — our grid is the M2 editor), charts, multiple sheets/tabs, .xlsx *import*, cell styling/fonts (later slices). Functions limited to the five above for M2.

## 6. Success metrics / done-signal
Type values + formulas → correct live results; frozen header; one click writes a real `.xlsx` that opens in Excel with values and the total intact. Engine is 100%-tested and pure.

## 7. Open questions
- Export destination: native Save dialog (host) for M2; agent/batch export comes with the Agent milestone.
