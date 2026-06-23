# Saathi — Engineering Protocol (the Constitution)

> This document governs **how** we build Saathi. It is binding. No code is written that violates it.
> Owner-mandated on 2026-06-23 after the single-file prototype was approved. Prototype = reference spec, this = process.
> Status: **APPROVED — owner sign-off 2026-06-23.** Changes now go through an ADR ([docs/adr](./adr)).

## 0. The prime directive — Plan → Document → Execute

For **every** unit of work (a "slice"):

1. **PLAN** — agree scope and approach (a one-page brief, reviewed).
2. **DOCUMENT** — author the **BA**, **DEV**, and **QA** docs and the **Test Plan → Test Suite → Test Cases** *before* implementation. Think first, write it down, then code.
3. **EXECUTE** — implement to make the documented tests pass, then review (code **and** visual UI).

> If it isn't documented, it isn't started. If it has no tests, it isn't done.

---

## 1. Architecture rules

### 1.1 SOLID — non-negotiable
- **S**ingle Responsibility · **O**pen/Closed · **L**iskov · **I**nterface Segregation · **D**ependency Inversion.
- Domain (business logic) depends on **abstractions (ports)**, never on concrete libraries or Electron/DOM APIs.

### 1.2 Hexagonal — Ports & Adapters (Anti-Corruption Layer)
- The **domain/core** is framework-agnostic, pure TypeScript, no `import` of any third-party runtime lib, no DOM, no Electron.
- **Inbound ports** = how the UI/agents drive the core (e.g. `BuildDeck`, `EvaluateFormula`).
- **Outbound ports** = how the core reaches the world (e.g. `LlmPort`, `FileExportPort`, `SearchPort`, `VectorStorePort`).
- **Adapters** implement ports and translate to/from the outside world. Adapters are the *only* place a vendor type appears.

### 1.3 The Wrapper Rule (owner rule #2 — "every external module import should have a wrapper")
- **No external module is imported directly into feature/domain code.** Every dependency (Univer, ExcelJS, docx, pptxgenjs, PDF.js, Ollama, SearXNG client, @ghostery/adblocker, electron-updater, KaTeX, Mermaid, Pyodide…) is accessed **only** through a hand-written wrapper module under `src/*/adapters/<vendor>/` that:
  - exposes **our** interface (a port), not the vendor's;
  - owns all vendor types (they never leak past the wrapper);
  - is independently unit-testable with the vendor mocked;
  - is the single swap-point if we change vendors.
- Enforced by an **import-boundary lint rule** (a dependency-cruiser / eslint-no-restricted-imports config) in CI.

### 1.4 DSA & complexity (owner rule #1 — "DSA optimization approach first")
- Before coding a non-trivial algorithm, state the **chosen data structure, time & space complexity, and why** in `DEV.md`.
- Hot paths (formula engine, RAG retrieval, large-grid render, ad-filter matching) get an explicit **complexity budget** and a perf test.
- Prefer the standard pattern; document any deviation with a benchmark.

### 1.5 Design patterns
- Use named GoF/architectural patterns deliberately (Adapter, Strategy, Factory, Observer, Command, Repository, Facade, State).
- Each `DEV.md` names the patterns used and why. No pattern for its own sake.

### 1.6 The narrator principle (carried from the product DNA)
- **Deterministic logic lives in our code; the LLM (Shiva) only narrates/phrases.** Engines guarantee correctness; the model writes prose. This is an architecture constraint, not a slogan — the formula result, the file bytes, the citations are computed, never hallucinated.

---

## 2. Vertical-slice discipline (owner rule #5 — "make one functionality full … then start another, join small make large")

- Work ships as **vertical slices**: a thin end-to-end path through UI → port → domain → adapter, **fully done** (docs + tests + visual review) before the next slice starts.
- **Milestone 0 = Walking Skeleton**: empty-but-real app that boots, routes, themes, and has a green CI — proves the spine before features.
- "Join small to make large": each slice composes with prior ones; no big-bang integration at the end.
- **WIP limit = 1 slice in flight.** Finish, review, merge, then pull the next.

---

## 3. Documentation standard (owner rule: "doc should have QA, BA, DEV doc")

Every slice has a folder `docs/features/<NN-slice>/` containing:

| Doc | Owner role | Answers |
|---|---|---|
| `BA.md` | Business Analyst | *Why* & *what*: problem, users, user stories, acceptance criteria, scope/out-of-scope, success metrics. |
| `DEV.md` | Developer | *How*: design, ports/adapters touched, data structures + complexity, patterns, sequence/flow, risks, ADR links. |
| `QA.md` | QA | *How we trust it*: risk-based test strategy for this slice, what each test level covers, entry/exit criteria, gates. |
| `TEST-PLAN.md` | QA | The plan → suites → cases (see §4). |

Plus repo-wide: `ARCHITECTURE.md`, `BUILD-PLAN.md`, **ADRs** in `docs/adr/NNNN-title.md` (one per significant decision), and a living `README.md`.

---

## 4. Testing standard (owner rules: "ready test cases — unit, integration, e2e", "test steps + expected behaviour at every step", "test plan → suite → cases written first")

### 4.1 Author order (test-first)
**Test Plan → Test Suite → Test Cases are written before/with implementation**, derived from `BA.md` acceptance criteria. Implementation makes them pass.

- **Test Plan** (per slice, IEEE-829-style): identifier, scope, items under test, features in/out, approach, environment, entry/exit criteria, risks, deliverables.
- **Test Suite**: a named group of cases for one capability/configuration.
- **Test Case**: id, title, preconditions, **numbered steps — each step has an Action and an Expected Result**, test data, and pass/fail. Written in Given/When/Then where it aids clarity.

### 4.2 The pyramid (many unit, fewer integration, few e2e)
- **Unit** (Vitest): pure domain + each adapter with the vendor mocked. Fast, deterministic, the bulk.
- **Integration** (Vitest): port + real adapter wired together (e.g. domain → ExcelJS adapter actually writes a valid `.xlsx`); IPC main↔renderer contracts.
- **E2E** (Playwright for Electron): real app, real user flows, the critical paths only.
- Every case states **expected behaviour at each step** — no "click and hope".

### 4.3 Gates
- New/changed domain & adapter code: **unit coverage ≥ 90%** lines/branches.
- Every slice ships with ≥1 integration test and (for user-facing flows) ≥1 e2e test.
- CI is **red-blocking**: no merge on failing tests, lint, typecheck, or coverage.

---

## 5. Definition of Done (owner rule #6 — "final review … check UI not just code but visual")

A slice is **Done** only when ALL hold:
1. `BA.md`, `DEV.md`, `QA.md`, `TEST-PLAN.md` complete and reviewed.
2. Code adheres to §1 (SOLID, hexagonal, Wrapper Rule, complexity documented).
3. Unit + integration + e2e tests present, **green**, coverage gate met.
4. `typecheck` + `lint` + import-boundary check green.
5. **Code review** approved (PR).
6. **Visual/UI review** approved — screenshots (light + a dark theme) attached to the PR; layout, alignment, theme, and the brand match the approved prototype. Pixel/visual regression snapshot stored.
7. Docs/README/CHANGELOG updated; ADRs filed for decisions.
8. Merged to `main` via PR with green required checks.

---

## 6. Per-type Expert-Agent architecture (owner rule #7)

The "AI build" for Office is a **multi-agent ReAct system**, one **expert per file type** (Slides, Sheets, Docs, PDF), coordinated by an Orchestrator. Agents **reason → act (call our deterministic tools) → observe**, **exchange feedback**, and **self-correct** against validators — but they only ever produce *content/structure*; our engines produce the *file*. Full design in [ARCHITECTURE.md](./ARCHITECTURE.md#expert-agents). This is product runtime (Shiva-driven, local). **Claude is used at DEV time to author new templates**, not at runtime.

---

## 7. Git & GitHub governance (owner rule #8 — public repo, rulesets, labeler, docs, README, tags)

- **Repo**: public, professional README (badges, screenshots, architecture, quickstart), LICENSE, `CODE_OF_CONDUCT.md`, `CONTRIBUTING.md`, `SECURITY.md`, topics/tags, social preview.
- **Branching**: trunk-based — short-lived `feat/*`, `fix/*`, `docs/*`, `chore/*` branches off `main`; small PRs.
- **Commits**: **Conventional Commits** (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`, `chore:` …), enforced by a ruleset + commitlint.
- **Versioning**: **SemVer**; release notes auto-generated from commits; git **tags** per release.
- **Branch ruleset on `main`**: require PR, ≥1 review, required status checks (build, typecheck, lint, unit, integration, e2e, coverage), linear history, no force-push, no deletion, signed commits where possible.
- **CODEOWNERS** + PR/issue templates + a **labeler** action (auto-label by path/type) + a triage label set.

---

## 8. CI/CD (owner rule #9 — implemented, download page LAST)

- **CI** (GitHub Actions) from M0: on every PR run install → typecheck → lint → import-boundary → unit → integration → e2e (headless) → coverage → build. Unique job names for status checks.
- **CD**: tag → build signed installers (Win first; mac/linux later) via electron-builder → GitHub Release with `electron-updater` feed.
- **Download page on keepvidya.com**: wired **last**, only once the app is functionally complete and a stable release exists (mirrors the Flows/Knovex download-page pattern).

---

## 9. Security baseline (Electron) — enforced from M0

- `contextIsolation: true`, `sandbox: true`, `nodeIntegration: false`, `webSecurity: true`, `enableRemoteModule: false`.
- **No raw Electron/IPC exposed to the renderer.** `contextBridge` exposes a **typed, minimal API — one method per IPC channel**, never `ipcRenderer.on` directly.
- **Validate IPC args in the preload AND again in the main handler** (defense in depth).
- Strict **CSP**; no remote code; external links open in the OS browser, not in-app.
- Secrets (BYOK keys) stored via OS keychain, never in plain files; nothing leaves the device unless the user enables it (Confidential mode honored).

---

## 10. Quality gates — summary

| Gate | Tool | Blocks merge? |
|---|---|---|
| Types | `tsc` strict | ✅ |
| Lint + format | ESLint + Prettier | ✅ |
| Import boundaries (Wrapper Rule) | dependency-cruiser / eslint | ✅ |
| Unit (≥90%) | Vitest + coverage | ✅ |
| Integration | Vitest | ✅ |
| E2E (critical paths) | Playwright-Electron | ✅ |
| Visual review + snapshot | screenshots + Playwright snapshot | ✅ (human + snapshot) |
| Conventional Commits | commitlint ruleset | ✅ |

---

## 11. Roles
- **BA** — frames the problem, writes user stories + acceptance criteria (`BA.md`).
- **DEV** — designs + implements within §1, writes `DEV.md`, code, and tests.
- **QA** — owns `QA.md` + `TEST-PLAN.md`, signs off the Definition of Done incl. visual review.
- **Expert agents** (runtime) — per file type, ReAct, peer feedback, self-correction (§6).

*(In this collaboration, Claude rotates through BA/DEV/QA per slice and produces the artifacts; the owner approves each gate.)*

---

## 12. Sources informing this protocol
- Hexagonal Architecture / Ports & Adapters — [Wikipedia](https://en.wikipedia.org/wiki/Hexagonal_architecture_(software)), [AWS Prescriptive Guidance](https://docs.aws.amazon.com/pdfs/prescriptive-guidance/latest/hexagonal-architectures/hexagonal-architectures.pdf), [tsh.io](https://tsh.io/blog/hexagonal-architecture)
- Test pyramid & IEEE-829/ISO-29119 — [Semaphore](https://semaphore.io/blog/testing-pyramid), [UK Home Office Engineering](https://engineering.homeoffice.gov.uk/standards/test-pyramid/), [Testriq IEEE-829 template](https://www.testriq.com/test-plan-template)
- Electron security — [Electron Security docs](https://www.electronjs.org/docs/latest/tutorial/security), [Context Isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation)
- GitHub governance — [Rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/available-rules-for-rulesets), [CODEOWNERS](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners), [Conventional Commits](https://www.conventionalcommits.org)
