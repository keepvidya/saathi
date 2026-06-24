# Saathi — your local AI workspace, by Keepvidya

> A private, **local-first** AI desktop suite — Chat, Knowledge, Learn, Create, **Office** (Slides/Sheets/Docs/PDF), a Shields browser, and an Agent. Runs on your machine on local AI (Ollama), with optional BYOK cloud. **The engines compute the truth; the model only narrates.**

[![CI](https://github.com/keepvidya/saathi/actions/workflows/ci.yml/badge.svg)](https://github.com/keepvidya/saathi/actions/workflows/ci.yml)
![stack](https://img.shields.io/badge/stack-Electron%20%C2%B7%20Vite%20%C2%B7%20TypeScript-3178c6)
![license](https://img.shields.io/badge/license-proprietary-lightgrey)

## Why
Office workers and students deserve a powerful, private workspace that doesn't ship their documents to someone else's cloud. Saathi fuses the best open-source engines behind a clean, branded shell — local by default.

## Status
Built in disciplined **vertical slices** ([docs/BUILD-PLAN.md](docs/BUILD-PLAN.md), [CHANGELOG.md](CHANGELOG.md)). Done so far: secure shell + 10/Light·Medium·Dark themes · **Chat** (local Ollama + offline fallback, markdown) · **Office** — a staged home, Sheets/Docs/Slides editors, per-type **expert-agent AI build**, and real `.xlsx / .docx / .pptx / .pdf` export · **Knowledge/RAG** — ingest text/PDF, lexical retrieval, and **extractive, cited** answers (no invented facts) · **Learn** — structured lessons with a **deterministic quiz engine** (our code grades & scores), **KaTeX math**, **Shiki-highlighted code**, **Mermaid diagrams**, **runnable Python** (Pyodide, on your machine), and read-aloud · **Browser + Shields** — a sandboxed multi-tab browser (WebContentsView) with a smart address/search bar and **ad/tracker blocking** (Ghostery engine, blocked-count badge, toggle) · **Agent** — a tool-using **ReAct** supervisor that delegates to real workers (the formula engine, knowledge search) and shows its trace · **Memory** — save private notes and recall them by relevance (our own full-text engine, persisted locally) · **Skills** — a catalogue of reusable recipes that compose the agent's real tools (answers computed, not guessed) · **Settings** — profile, AI provider (offline Ollama/Shiva or cloud BYOK), search keys (**encrypted**, never shown back), theme · a friendly **first-run onboarding** wizard (name → AI → search) · a **Windows installer** (`npm run package` → `Saathi-Setup.exe`, electron-builder NSIS, Pyodide asar-unpacked, auto-update scaffold). Next: CI release pipeline + a keepvidya.com download page.

## Architecture (at a glance)
Hexagonal **Ports & Adapters**: a framework-agnostic **domain core** reached through ports; every external library and the Electron boundary sit behind hand-written **adapters** (the *Wrapper Rule*). See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

```
renderer (vanilla TS UI) → application (use-cases) → domain (pure) → ports → adapters (vendors) → platform (Electron)
```

## Quickstart (dev)
```bash
npm install
npm run dev          # launch the app with HMR
npm run test:unit    # unit + integration (Vitest)
npm run build        # bundle main/preload/renderer
npm run test:e2e     # Playwright-Electron smoke (after build)
npm run ci           # typecheck + lint + boundary + tests + build
```

## How we build (read before contributing)
- [docs/ENGINEERING-PROTOCOL.md](docs/ENGINEERING-PROTOCOL.md) — the constitution (SOLID, hexagonal, Wrapper Rule, test-first, Definition of Done incl. visual review).
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — layers, security model, per-type expert agents.
- [docs/BUILD-PLAN.md](docs/BUILD-PLAN.md) — milestone roadmap.
- Per-feature docs live in [docs/features/](docs/features) (BA / DEV / QA / TEST-PLAN); decisions in [docs/adr/](docs/adr).

## License
Proprietary © Keepvidya. All rights reserved.
