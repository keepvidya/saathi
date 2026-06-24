# QA — 10-learn

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Quiz grades the wrong answer as right | L | **H** (DNA/trust) | `gradeQuiz` + `scoreLesson` units |
| Score miscount (answered vs total) | M | M | `scoreLesson` units (partial answers) |
| XSS via lesson prose/code | L | **H** | escape-first markdown + escaped code |
| Read-aloud crashes where unsupported | M | M | `SpeechPort` fallback unit |
| Re-answering corrupts the score | M | M | pane locks after answer (integration) |

## 2. Test approach by level
- **Unit (domain)**: `gradeQuiz` (correct + incorrect), `scoreLesson` (all-correct / partial / none / unanswered), `lessonPlainText` (prose stripped + questions; no markdown markers), `sampleLesson` shape.
- **Unit (frontend adapter)**: `WebSpeech` calls `speechSynthesis.speak`/`cancel` (mocked); `makeSpeech` returns `SilentSpeech` when unsupported; `SilentSpeech` no-ops.
- **Integration (frontend)**: Learn pane renders prose/code/quiz; answering right → correct + explanation + locked; answering wrong → incorrect + correct option revealed; score chip updates; Read aloud invokes the speech port.
- **E2E**: open Learn → answer a quiz → see correct/incorrect + explanation + score.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 render blocks | — | TC-10.2.1 | — |
| AC-2 deterministic grade | TC-10.1.2 | TC-10.2.2 | TC-10.3.1 |
| AC-3 score | TC-10.1.3 | TC-10.2.2 | TC-10.3.1 |
| AC-4 read aloud | TC-10.1.4 | TC-10.2.3 | TC-10.3.1 |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M7 green.
- **Exit (Done)**: all TCs pass; domain + speech-adapter coverage ≥90%; lint/typecheck/boundary green; code + **visual review** (Learn: prose/code/quiz, correct + incorrect states, score, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Lesson renders: title, prose (markdown), code block
- [ ] Quiz: options, correct state (green/brand), incorrect state + revealed answer + explanation
- [ ] Score chip; Read-aloud control
- [ ] Brand tokens light + dark (copper accent only)
- [ ] Screenshots (learn light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: `sampleLesson()`; a mocked `speechSynthesis` for the adapter unit.
