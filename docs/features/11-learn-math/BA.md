# BA — 11-learn-math (M8b · Learn rich rendering: Math)

## 1. Problem & context
Real lessons have **math**. M8 shipped lessons (prose/code/quiz); a maths formula written as raw `a^2+b^2=c^2` is unreadable. This slice renders **TeX math** beautifully (KaTeX) inside lessons — and establishes the **frontend Wrapper-Rule** (vendor render libraries isolated behind a port/adapter), the reusable convention for the remaining rich renderers (Shiki / Mermaid / Pyodide / Piper).

## 2. Users & jobs-to-be-done
- Primary: a learner studying anything quantitative. Job: "When a lesson has a formula, I want to see it typeset properly, so I can read and trust it."

## 3. User stories
- **US-1**: As a learner, I see **inline** math within a sentence and **display** (block) math on its own line, rendered as proper notation.
- **US-2**: As a learner, a malformed formula doesn't break the lesson — it degrades to readable text.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a `math` block WHEN the lesson renders THEN the TeX is typeset by KaTeX (KaTeX markup present); display vs inline is honoured. *(→ TC-11.1.1, TC-11.2.1, TC-11.3.1)*
- **AC-2** (US-2): GIVEN invalid TeX THEN rendering does **not throw**; a readable fallback (the source text) is shown. *(→ TC-11.1.2, TC-11.2.2)*
- **AC-3** (architecture): KaTeX is imported **only** inside `frontend/src/adapters/**` (frontend Wrapper-Rule), enforced by ESLint + dependency-cruiser; math is reached through a `MathRenderPort`. *(→ CI boundary check)*

## 5. Scope
- **In**: a `math` block in the Lesson model (`@saathi/domain`, non-breaking union extension); a `MathRenderPort` + **KaTeX adapter** (`@saathi/frontend/adapters/katex`) with a deterministic `PlainMath` fallback; the **frontend Wrapper-Rule** (lint + dep-cruiser) and the CSP `font-src 'self'` change so KaTeX fonts load when packaged; the Learn pane rendering math blocks.
- **Out** (later slices): **Shiki** (code highlighting), **Mermaid** (diagrams), **Pyodide** (runnable Python), **Piper TTS** — each its own wrapped frontend adapter using the convention this slice establishes.

## 6. Success metrics / done-signal
Open Learn, see a typeset formula (inline + display); a broken formula shows as text, not a crash; KaTeX never leaks outside its adapter (CI boundary green).

## 7. Open questions / decisions for owner
- None. Math read-aloud stays out (TeX isn't narration-friendly); `lessonPlainText` skips math blocks.
