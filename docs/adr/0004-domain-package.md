# ADR-0004 — Add `@saathi/domain` (shared pure core)

- **Status**: Accepted
- **Date**: 2026-06-23
- **Amends**: ADR-0003 (which placed `domain/` inside `@saathi/backend`)

## Context
M2's formula engine is pure business logic that **both sides** need: the **frontend** must recompute a grid live as the user types (no IPC round-trip per keystroke), and the **backend** must use the same logic to export/validate files and drive agents. Putting it inside `@saathi/backend` would force the frontend to either import the backend (forbidden) or duplicate the engine (worse).

## Decision
Introduce **`@saathi/domain`** — a 5th workspace package holding the **framework-agnostic core** (entities, value objects, pure services like the spreadsheet model + formula engine). It imports **nothing** (no electron, no DOM, no other `@saathi/*` except `@saathi/shared` types if needed). Both `@saathi/frontend` and `@saathi/backend` may depend on it.

Updated boundaries:
| Package | May import |
|---|---|
| `@saathi/shared` | — |
| `@saathi/domain` | `@saathi/shared` (types only) |
| `@saathi/backend` | `@saathi/shared`, `@saathi/domain` |
| `@saathi/frontend` | `@saathi/shared`, `@saathi/domain` |
| `@saathi/desktop` | all of the above |

Still forbidden: **frontend ⇎ backend** (never import each other); **domain/frontend → electron**; **domain → DOM**. Enforced by ESLint + dependency-cruiser.

## Consequences
- The hexagonal "domain at the centre" is now literal — one engine, one source of truth, used by UI and host alike.
- `@saathi/backend` keeps application use-cases + **adapters** (the Wrapper Rule for ExcelJS/Univer/etc.); the pure core moves to `@saathi/domain`.
- Sets the pattern for every future engine (sheet, deck, doc, rag): pure logic in `domain`, vendor wrappers in `backend`, UI in `frontend`.
