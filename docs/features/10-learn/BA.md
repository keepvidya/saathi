# BA — 10-learn

## 1. Problem & context
People learn best from **structured, interactive** material, not walls of text. Learn turns a topic into a lesson — prose, code, and **questions that check understanding** — and reads it aloud. Per our DNA, the **grading is computed by our code** (a right answer is right because the engine says so, never because a model claimed it); a model may *write* lesson prose later, but it never decides correctness.

## 2. Users & jobs-to-be-done
- Primary: a learner (student, self-teacher, someone skilling up). Job: "When I study a topic, I want to read it, try a question, and get told if I'm right and why — so that I actually understand, not just skim."

## 3. User stories
- **US-1**: As a learner, I see a lesson as readable sections (prose + code), so I can follow along.
- **US-2**: As a learner, I answer an in-lesson **quiz** and immediately see whether I'm right, with an explanation.
- **US-3**: As a learner, I see my **score** across the lesson's questions, so I know how I did.
- **US-4**: As a learner, I can have the lesson **read aloud**, so I can listen hands-free.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN a `Lesson` of prose/code/quiz blocks WHEN rendered THEN prose shows as formatted text and code as a code block. *(→ TC-10.1.1, TC-10.2.1)*
- **AC-2** (US-2): GIVEN a quiz WHEN I pick an option THEN the engine **deterministically** marks it correct/incorrect and shows the explanation; the right answer is highlighted. *(→ TC-10.1.2, TC-10.2.2)*
- **AC-3** (US-3): GIVEN answered quizzes THEN the lesson **score** = correct / total is computed by the engine. *(→ TC-10.1.3, TC-10.2.2)*
- **AC-4** (US-4): GIVEN a lesson WHEN I press Read aloud THEN the lesson's narration text is spoken (Web Speech), and stop halts it; absent speech support it degrades silently. *(→ TC-10.1.4, TC-10.2.3, TC-10.3.1)*

## 5. Scope
- **In**: a pure **Lesson model** (prose / code / quiz blocks) + a **deterministic quiz engine** (`gradeQuiz`, `scoreLesson`) + `lessonPlainText` + `sampleLesson` (`@saathi/domain`); a **Learn pane** (render blocks, interactive quiz with our grading + running score, read-aloud) with a **wrapped Web Speech** read-aloud adapter (`@saathi/frontend`).
- **Out** (→ **M8b "Learn — rich rendering"**): **math (KaTeX)**, **diagrams (Mermaid)**, **syntax highlighting (Shiki)**, **runnable Python (Pyodide)**, and **Piper TTS** — each needs a wrapped render/exec adapter (and KaTeX/fonts need a CSP `font-src 'self'` change), handled deliberately as a follow-on. Also out: lesson authoring UI, persistence, AI-generated lessons (a later `LlmPort` reuse).

## 6. Success metrics / done-signal
Open Learn, read a lesson, answer a question and get an instant correct/incorrect + explanation, see a score, and hear it read aloud — deterministically, offline.

## 7. Open questions / decisions for owner
- None blocking. Math/diagrams/code-exec/Piper are tracked as **M8b**; this slice ships the lesson + quiz engine + read-aloud walking skeleton (consistent with the M4/M4b, M5/M5b splits).
