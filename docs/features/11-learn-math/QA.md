# QA — 11-learn-math

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Math not typeset / renders as raw TeX | M | M | KaTeX adapter unit + pane integration |
| Invalid TeX crashes the lesson | M | **H** | `throwOnError:false` + `PlainMath` fallback |
| KaTeX leaks outside its adapter | L | M | frontend Wrapper-Rule (CI boundary) |
| Fonts blocked when packaged | M | M | CSP `font-src 'self'`; visual review |

## 2. Test approach by level
- **Unit (domain)**: `sampleLesson` includes a math block; `lessonPlainText` omits math.
- **Unit (frontend adapter)**: `KatexMath.toHtml` produces KaTeX markup for valid TeX (display + inline); invalid TeX does not throw; `PlainMath` returns escaped source.
- **Integration (frontend)**: Learn pane renders a `.lsn-math` containing KaTeX output for a math block.
- **E2E**: Learn shows a typeset formula (`.lsn-math .katex` visible).
- **Boundary (CI)**: dependency-cruiser/ESLint fail if `katex` is imported outside `frontend/src/adapters`.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 typeset | TC-11.1.1 | TC-11.2.1 | TC-11.3.1 |
| AC-2 fallback | TC-11.1.2 | TC-11.2.2 | — |
| AC-3 boundary | — | — | CI boundary |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M8 green.
- **Exit (Done)**: all TCs pass; adapter coverage ≥90%; lint/typecheck/**boundary** green (Wrapper-Rule active); code + **visual review** (typeset inline + display math, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Inline math within prose; display math as a centred block
- [ ] Typeset correctly (KaTeX), legible in light + dark
- [ ] Invalid TeX degrades to readable text (no broken layout)
- [ ] Screenshots (learn-math light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: `sampleLesson()` (now with a formula); a known-good TeX (`a^2+b^2=c^2`) + a malformed one.
