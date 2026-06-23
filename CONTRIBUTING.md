# Contributing to Saathi

Saathi is built to a strict engineering protocol. **Read [docs/ENGINEERING-PROTOCOL.md](docs/ENGINEERING-PROTOCOL.md) before contributing** — it is binding.

## The short version
- **Plan → Document → Execute.** Every change is a vertical slice with `BA.md` / `DEV.md` / `QA.md` / `TEST-PLAN.md` under `docs/features/<NN-slice>/` *before* code.
- **SOLID + hexagonal Ports & Adapters.** The domain core is pure; every external library and the Electron boundary sit behind a hand-written adapter (the **Wrapper Rule**). Backend and frontend never import each other.
- **Test-first.** Unit + integration + e2e; every test step has an Action and an Expected Result. New domain/adapter code needs ≥90% coverage.
- **Definition of Done** includes a **visual/UI review** (light + dark screenshots on the PR).

## Workflow
1. Branch off `main`: `feat/*`, `fix/*`, `docs/*`, `chore/*`.
2. Write the slice docs + tests, then the code.
3. Run the gate locally: `npm run ci` then `npm run build && npm run test:e2e`.
4. Open a PR (Conventional Commits). CI must be green; a review is required.

## Commands
```bash
npm install
npm run dev            # launch the app (HMR)
npm run dev:frontend   # run the UI standalone in a browser
npm run ci             # typecheck + lint + boundary + tests + build
npm run test:e2e       # Playwright-Electron (after a build)
```

## Architecture
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md). Packages: `@saathi/shared` (contracts), `@saathi/domain` (pure core), `@saathi/backend` (Node + adapters), `@saathi/frontend` (UI), `@saathi/desktop` (Electron host).
