# TEST PLAN — 09-knowledge-rag

- **Plan id**: TP-09
- **Items under test**: `@saathi/domain` (`chunkText`, `Corpus`, `retrieve`, `composeAnswer`), `@saathi/backend` pdf.js (pdfjs-dist) adapter, frontend Knowledge pane, `pdf:extractText` IPC
- **Approach**: unit (domain) + integration (backend + frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-09.1 — RAG engine (UNIT · domain)

### TC-09.1.1 — chunking + corpus
| # | Action | Expected |
|---|---|---|
| 1 | `chunkText(longText)` | ≥2 chunks, each non-empty, indexed |
| 2 | `Corpus.add(doc)` then `chunks()` | chunks carry the doc id + title |

### TC-09.1.2 — retrieval ranks the matching passage first
| # | Action | Expected |
|---|---|---|
| 1 | corpus with docs about "photosynthesis" and "taxes"; `retrieve('how does photosynthesis work', 2)` | top hit's chunk contains 'photosynthesis'; the tax chunk ranks lower or absent |
| 2 | `retrieve(q, 1)` | returns exactly 1 hit |

### TC-09.1.3 — extractive, cited, grounded answer
| # | Action | Expected |
|---|---|---|
| 1 | `composeAnswer('photosynthesis', hits)` | `answer` contains text that appears in a source chunk (no invented words); includes a `[1]` marker |
| 2 | `citations` | `[{ n:1, docTitle, snippet }]` pointing to the source doc |
| 3 | empty hits | a graceful "couldn't find …" answer, no citations |

---
## Suite TS-09.2 — Extract & pane (INTEGRATION)

### TC-09.2.1 — pdf.js extracts text (backend)
| # | Action | Expected |
|---|---|---|
| 1 | make a PDF via the pdf-lib adapter containing 'Knowledge base phrase' | bytes |
| 2 | `PdfJsRead.extractText(bytes)` | returned text contains 'Knowledge base phrase' |

### TC-09.2.2 — Knowledge pane ingest → ask (frontend)
| # | Action | Expected |
|---|---|---|
| 1 | render Knowledge; add a doc with known text | it appears in the doc list |
| 2 | type a query matching it; ask | an answer renders + a citation chip with the doc title |

---
## Suite TS-09.3 — Flow (E2E · Playwright-Electron)

### TC-09.3.1 — Knowledge: add → ask → cited answer
| # | Action | Expected |
|---|---|---|
| 1 | launch → Knowledge; paste a document + title; Add | doc listed |
| 2 | ask a question about it | an answer + a citation appear |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-09.1.1, TC-09.2.1, TC-09.3.1 |
| AC-2 | TC-09.1.2 |
| AC-3 | TC-09.1.3, TC-09.2.2, TC-09.3.1 |
| AC-4 | TC-09.1.3 |
