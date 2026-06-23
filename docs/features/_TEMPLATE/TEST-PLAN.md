# TEST PLAN — <NN-slice-name>

> IEEE-829-aligned. Written FIRST (test-first). Plan → Suites → Cases. **Every case step has an Action and an Expected Result.**

## 1. Test plan header
- **Plan id**: TP-<NN>
- **Items under test**: <modules/ports/UI>
- **Features in scope** / **out of scope**: …
- **Approach**: unit + integration + e2e (per QA.md)
- **Environment**: <OS, build, data>
- **Entry / exit criteria**: see QA.md
- **Risks / deliverables**: …

---

## Suite TS-<NN>.1 — <capability> (UNIT)
### TC-<NN>.1.1 — <title>
- **Preconditions**: …
- **Test data**: …

| # | Action (step) | Expected result |
|---|---|---|
| 1 | … | … |
| 2 | … | … |

- **Pass/Fail**: ☐

*(repeat TC blocks)*

---

## Suite TS-<NN>.2 — <capability> (INTEGRATION)
### TC-<NN>.2.1 — <title>
- **Preconditions**: real adapter wired (vendor NOT mocked)

| # | Action | Expected result |
|---|---|---|
| 1 | … | … |

- **Pass/Fail**: ☐

---

## Suite TS-<NN>.3 — <critical flow> (E2E)
### TC-<NN>.3.1 — <title>
- **Preconditions**: app launched (Playwright-Electron)

| # | Action | Expected result |
|---|---|---|
| 1 | Launch app | Window visible, rail rendered |
| 2 | … | … |

- **Pass/Fail**: ☐

---

## Traceability
| Acceptance criterion (BA) | Covered by |
|---|---|
| AC-1 | TC-<NN>.1.1, TC-<NN>.3.1 |
