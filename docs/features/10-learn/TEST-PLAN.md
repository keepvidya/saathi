# TEST PLAN — 10-learn

- **Plan id**: TP-10
- **Items under test**: `@saathi/domain/learn` (`gradeQuiz`, `scoreLesson`, `lessonPlainText`, `sampleLesson`), `@saathi/frontend` Web Speech adapter (`WebSpeech`/`SilentSpeech`/`makeSpeech`), Learn pane.
- **Approach**: unit (domain + adapter) + integration (pane) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-10.1 — Lesson + quiz engine (UNIT · domain)

### TC-10.1.1 — sample lesson shape
| # | Action | Expected |
|---|---|---|
| 1 | `sampleLesson()` | a title + ≥1 prose, ≥1 code, ≥2 quiz blocks; quiz ids unique |

### TC-10.1.2 — gradeQuiz is deterministic
| # | Action | Expected |
|---|---|---|
| 1 | `gradeQuiz(quiz, quiz.answer)` | `{ correct:true, answer, explain }` |
| 2 | `gradeQuiz(quiz, other)` | `{ correct:false, chosen:other, answer, explain }` |

### TC-10.1.3 — scoreLesson tallies correct/total/answered
| # | Action | Expected |
|---|---|---|
| 1 | answers: both quizzes correct | `{ correct:2, total:2, answered:2 }` |
| 2 | answers: one correct, one wrong | `{ correct:1, total:2, answered:2 }` |
| 3 | answers: only one answered | `answered:1`, `total:2` |
| 4 | answers: empty map | `{ correct:0, total:2, answered:0 }` |

### TC-10.1.4 — lessonPlainText is narration-ready
| # | Action | Expected |
|---|---|---|
| 1 | `lessonPlainText(sampleLesson())` | contains prose text + quiz questions; no `#`/`*`/backtick markdown markers |

---
## Suite TS-10.2 — Learn pane + speech (INTEGRATION · frontend)

### TC-10.2.1 — renders blocks
| # | Action | Expected |
|---|---|---|
| 1 | render Learn | title shown; a `.lsn-prose`, a `.lsn-code`, and `.lsn-quiz` present |

### TC-10.2.2 — interactive quiz + score
| # | Action | Expected |
|---|---|---|
| 1 | click the correct option | option marked correct; explanation shown; options lock |
| 2 | (other quiz) click a wrong option | marked incorrect; the correct option revealed; explanation shown |
| 3 | after answering | score chip shows correct/total from `scoreLesson` |

### TC-10.2.3 — speech adapter
| # | Action | Expected |
|---|---|---|
| 1 | `WebSpeech.speak` with mocked `speechSynthesis` | calls `cancel` then `speak` |
| 2 | `makeSpeech()` in jsdom (no speech) | returns `SilentSpeech`; `speak`/`stop` no-op |
| 3 | Learn "Read aloud" click (injected spy port) | port `.speak` called with the lesson narration |

---
## Suite TS-10.3 — Flow (E2E · Playwright-Electron)

### TC-10.3.1 — Learn: read → answer → score
| # | Action | Expected |
|---|---|---|
| 1 | launch → Learn | lesson renders (prose + code + quiz) |
| 2 | answer a quiz correctly | correct state + explanation appear |
| 3 | observe | score chip updates |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-10.2.1 |
| AC-2 | TC-10.1.2, TC-10.2.2, TC-10.3.1 |
| AC-3 | TC-10.1.3, TC-10.2.2, TC-10.3.1 |
| AC-4 | TC-10.1.4, TC-10.2.3, TC-10.3.1 |
