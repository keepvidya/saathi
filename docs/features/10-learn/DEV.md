# DEV — 10-learn

## 1. Approach
A pure **Lesson** core in `@saathi/domain` and an interactive **Learn pane** in `@saathi/frontend`. A `Lesson` is an ordered list of typed blocks (`prose` | `code` | `quiz`). The deterministic logic — the part that must be trustworthy — is the **quiz engine**: `gradeQuiz(quiz, chosen)` decides correctness, `scoreLesson(lesson, answers)` tallies correct/total. Prose renders via the existing **`markdownToHtml`** (M6, XSS-safe). Read-aloud is a wrapped **Web Speech** adapter behind a `SpeechPort` (built-in browser API, not an npm vendor) with a silent fallback so tests / unsupported environments degrade gracefully. No LLM in the loop: a model could later author lesson prose behind a port, but correctness and scoring are always our code.

## 2. Ports touched
- **Frontend seam**: `SpeechPort { speak(text: string): void; stop(): void }` — impl `WebSpeech` (`window.speechSynthesis`), fallback `SilentSpeech`; `makeSpeech()` feature-detects. No IPC, no backend (rendering + speech are renderer concerns).
- No new IPC channel, no backend adapter (M8 core is renderer + domain only). M8b adds frontend render adapters (KaTeX/Mermaid/Shiki) + a Pyodide exec port.

## 3. Domain model
- `LessonBlock = { kind:'prose'; markdown } | { kind:'code'; lang; source } | { kind:'quiz'; id; question; options[]; answer; explain }`.
- `Lesson { title; subtitle?; blocks[] }`.
- `gradeQuiz(quiz, chosen) → { correct, chosen, answer, explain }`.
- `scoreLesson(lesson, answers: ReadonlyMap<quizId, chosen>) → { correct, total, answered }`.
- `lessonPlainText(lesson) → string` (prose with markdown markers stripped + quiz questions — the narration for read-aloud / search).
- `sampleLesson()` — a short ready lesson (prose + a code block + two quizzes).

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Notes |
|---|---|---|---|
| Grade one quiz | equality check | O(1) | `chosen === answer` |
| Score a lesson | single pass over blocks | O(b) | `Map` lookups O(1) |
| Plain text | single pass + regex strip | O(n) | for TTS/search |

## 5. Design patterns
- **Composite** (a lesson is a tree of typed blocks), **Strategy/Adapter** (`SpeechPort` — Web Speech now, Piper later), **Pure function core** (engine has no I/O), **Dependency Inversion** (pane depends on `SpeechPort`, not `speechSynthesis`).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **Web Speech API** (browser built-in, not npm) | `frontend/src/adapters/speech/speech.adapter.ts` | `SpeechPort` | wrapped for testability + the future Piper swap; no node_modules dep, so no boundary-config change |

*(M8b will add KaTeX/Mermaid/Shiki/Pyodide as wrapped frontend adapters and extend the Wrapper Rule + CSP `font-src` then.)*

## 7. Flow / sequence
Render: `lesson.blocks` → per kind → prose (`markdownToHtml`), code (escaped `<pre>`), quiz (question + option buttons). Answer: click option → `gradeQuiz` → mark correct/incorrect + reveal explanation + the correct option; record into an in-pane `answers` Map → `scoreLesson` → update the score chip. Read aloud: `makeSpeech().speak(lessonPlainText(lesson))`; Stop → `.stop()`.

## 8. Error handling
Quiz already answered → options lock (no re-grade). No speech support → `SilentSpeech` no-ops (button still present, does nothing harmful). Empty lesson → renders the title only (no crash).

## 9. Risks & mitigations
- **"Trust me" grading** → grading is a pure, unit-tested equality in our engine; the UI only reflects it. Unit test asserts correct/incorrect + score.
- **XSS via lesson prose** → prose goes through the existing escape-first `markdownToHtml`; code blocks are HTML-escaped.
- **Speech API variance** → behind `SpeechPort` + feature-detect; unit-tested with a mocked `speechSynthesis` and the silent fallback.

## 10. ADRs
No new ADR (reuses ADR-0004 domain + the frontend pane pattern). M8b's exec/render adapters may warrant one (Pyodide worker + CSP).
