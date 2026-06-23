# ADR-0003 — Monorepo with separated backend / frontend packages (no monolith)

- **Status**: Accepted (owner-directed 2026-06-23)
- **Date**: 2026-06-23
- **Amends**: ADR-0002 (stack stays Electron + Vite + vanilla TS; this changes the *packaging*)

## Context
The M0 scaffold was a single package mixing renderer (UI) and Node/Electron code. The owner requires **backend and frontend kept separate, separated in the repo, and explicitly not a monolithic architecture.**

## Decision
Adopt an **npm-workspaces monorepo** (one repo, clearly separated packages):

| Package | Role | May import | MUST NOT import |
|---|---|---|---|
| **@saathi/shared** | contracts: IPC channel names, `Result`, shared DTOs | (nothing) | electron, DOM, other packages |
| **@saathi/backend** | the Node "backend": domain (pure) + application + ports + adapters (engines: Office/RAG/LLM…) | `@saathi/shared` | electron, DOM, `@saathi/frontend` |
| **@saathi/frontend** | the UI: renderer shell, panes, theme, widgets. Runs **standalone in a browser** too. | `@saathi/shared` (types) | electron, `@saathi/backend` |
| **@saathi/desktop** | thin Electron **host**: main + preload; composition root that wires backend ↔ frontend over IPC | `@saathi/shared`, `@saathi/backend`, `@saathi/frontend` | (—) |

- **Backend ⟂ Frontend**: they never import each other. They communicate only through the **IPC contract** in `@saathi/shared`, bridged by `@saathi/desktop`. This is the hexagonal boundary made physical.
- **Frontend is independently runnable** (its own Vite app) — UI can be developed/tested without Electron (the bridge falls back gracefully). Proves the separation.
- **Backend is a pure, reusable library** — no Electron/DOM — usable later by a CLI/headless/server without change.
- Boundaries are **enforced** by ESLint `no-restricted-imports` + dependency-cruiser rules in CI (build fails on a cross-boundary import).

## Consequences
- Slightly more config (4 `package.json` + per-package `tsconfig` with different libs — backend has **no DOM lib**, frontend has DOM). This is a feature: the compiler now stops backend code from touching the DOM and vice-versa.
- `@saathi/desktop` is the only place Electron and the two sides meet.
- Future split into separate repos (if ever needed) is trivial — packages are already isolated.

## Alternatives rejected
- **Single package (monolith)** — owner rejected; mixes concerns, weak boundaries.
- **Two separate repos now** — overkill for one product; loses atomic cross-cutting changes. Monorepo gives separation *and* one-PR changes; can split later.
