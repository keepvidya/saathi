# DEV — 02-office-sheets

## 1. Approach
Build the spreadsheet as **pure domain** in `@saathi/domain` (model + a real recursive-descent formula evaluator — **no `eval`/`Function`**). `@saathi/frontend` renders an editable grid that calls the domain engine for **live recompute** (no IPC per keystroke). `@saathi/backend` wraps **ExcelJS** behind `SpreadsheetExportPort` to emit `.xlsx`. `@saathi/desktop` adds one IPC channel `sheet:exportXlsx` + a Save dialog and calls the backend adapter (composition root).

## 2. Ports touched
- **Outbound**: `SpreadsheetExportPort { toXlsx(sheet: SheetData): Promise<Uint8Array> }` (in `@saathi/backend/ports`), implemented by the ExcelJS adapter.
- **IPC**: `sheet:exportXlsx` (renderer → main): payload = serialized `SheetData`; main writes file via dialog.

## 3. Domain model (`@saathi/domain`)
- `CellRef` value object — `parseRef("B2") → {col:1,row:2}`, `formatRef`, `expandRange("B2","D2") → CellRef[]`.
- `Sheet` — `Map<string, string>` raw cell contents (formulas start with `=`); `getRaw/setRaw`, `evaluate(ref)`, `display(ref)`, `recompute()`.
- `evaluate` — tokenize → recursive-descent parse (`+ - * / ( )`, numbers, refs, ranges, function calls `SUM/AVERAGE/MIN/MAX/COUNT`) → number; **cycle detection** via a visiting-set → `#CIRC`; bad input → `#ERR`. Non-numeric raw text evaluates to its string for display, `0` inside arithmetic.

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Space | Why |
|---|---|---|---|---|
| Parse a formula | recursive-descent over a token array | O(t) tokens | O(t) | linear, no backtracking |
| Evaluate one cell | DFS over referenced cells | O(d) referenced cells | O(d) stack | memo within a recompute pass keeps a full sheet O(n) |
| Cycle detection | `Set<ref>` on the eval stack | O(1)/step | O(d) | returns `#CIRC`, never loops |
| Expand range | arithmetic on col/row indices | O(w·h) | O(w·h) | only the referenced rectangle |

## 5. Design patterns
- **Value Object** (`CellRef`), **Interpreter** (the expression evaluator), **Repository-ish** (`Sheet` owns cell state), **Adapter** (ExcelJS), **Facade** (frontend grid controller), **Strategy** (functions table).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Vendor types leak? |
|---|---|---|---|
| **ExcelJS** | `backend/adapters/exceljs/exceljs-export.adapter.ts` | `SpreadsheetExportPort` | no (only `SheetData` in/out, `Uint8Array` out) |

ExcelJS is imported in exactly one file; CI import-boundary fails on any other import of it.

## 7. Flow / sequence
Edit cell → grid updates `Sheet.setRaw` → `Sheet.recompute()` → re-render display + formula bar (all in `@saathi/domain`, in-renderer). Export → grid serializes `SheetData` → `bridge.exportXlsx(data)` → IPC `sheet:exportXlsx` → main: Save dialog → `ExcelJsExport.toXlsx(data)` → write file.

## 8. Error handling
Formula errors are **values** (`#ERR`, `#CIRC`, `#DIV/0`), never thrown. Export returns `Result<savedPath, error>`. IPC args validated in preload + main.

## 9. Risks & mitigations
- **Wrong formula results** → exhaustive domain unit tests (functions, ranges, precedence, deps, errors, cycles).
- **`eval` security** → none used; hand-written parser.
- **Export fidelity** → integration test writes a real `.xlsx`, re-reads it with ExcelJS, asserts values + the computed total.
- **Perf on large grids** → O(n) recompute with per-pass memo; complexity budgeted above.

## 10. ADRs
- [ADR-0004](../../adr/0004-domain-package.md) — adds `@saathi/domain`.
