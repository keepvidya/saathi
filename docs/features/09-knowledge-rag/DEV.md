# DEV — 09-knowledge-rag

## 1. Approach
Pure RAG core in `@saathi/domain`: `chunkText` → a `Corpus` of `{docId, docTitle, index, text}` chunks; a lexical **`retrieve(query, k)`** (TF-IDF: term-frequency in a chunk × inverse-doc-frequency across chunks) returning ranked chunks; an extractive **`composeAnswer(query, hits)`** → `{ answer, citations }` (quotes the top passage, numbers `[n]` back to the source doc). All deterministic — no LLM in the grounding path (narrator: the engine retrieves + cites; a model can rephrase later behind the port). `@saathi/backend` wraps **pdf.js (`pdfjs-dist`, legacy Node build)** behind `PdfReadPort` for PDF text. *(pdf-parse was evaluated first but its bundled, ancient pdf.js fails to initialise on Node 22 — `pdfjs-dist` is the official, maintained library and extracts cleanly in Node.)* `@saathi/frontend` is the Knowledge pane (ingest text/PDF, doc list, query → engine → answer + citations). PDF upload: renderer reads file bytes → `pdf:extractText` IPC → backend → text → ingest.

## 2. Ports touched
- **Outbound**: `PdfReadPort { extractText(bytes: Uint8Array): Promise<string> }` (`@saathi/backend/ports`), impl by the pdf.js adapter. (Retrieval is a future `RetrievalPort` for the DocNest swap; M7 ships the in-domain retriever.)
- **IPC**: `pdf:extractText` (renderer → main): payload = bytes; returns text.

## 3. Domain model
- `KnowledgeDoc { id, title, text }`; `Chunk { docId, docTitle, index, text }`; `Hit { chunk, score }`; `Citation { n, docTitle, snippet }`.
- `chunkText(text, size=600)` → chunks on paragraph/size boundaries. `Corpus.add(doc)`, `Corpus.chunks()`. `retrieve(corpus, query, k=4)`. `composeAnswer(query, hits)`.

## 4. Data structures & complexity (DSA)
| Operation | Structure | Time | Notes |
|---|---|---|---|
| Tokenize | regex split | O(n) | lowercase word tokens |
| IDF | `Map<term, df>` | O(N·t) once | N chunks |
| Score a query | sum tf·idf over query terms | O(q·N) | small q; fine for local corpora |
| Top-k | partial sort | O(N log k) | k=4 |

## 5. Design patterns
- **Repository** (`Corpus`), **Strategy** (retriever — swappable for embeddings/DocNest), **Adapter** (pdf-parse), **Facade** (Knowledge controller). **Dependency Inversion** via `RetrievalPort` later.

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **pdfjs-dist** (pdf.js) | `backend/adapters/pdfjs/pdf-read.adapter.ts` | `PdfReadPort` | the only file importing pdfjs-dist; `vendor-only-in-adapter` rule extended |

## 7. Flow / sequence
Ingest text: `corpus.add({id,title,text})`. Ingest PDF: file → bytes → `bridge.extractPdfText(bytes)` (IPC→pdf-parse) → `corpus.add`. Ask: `retrieve(corpus, query, 4)` → `composeAnswer(query, hits)` → render answer (markdown) + a citations list.

## 8. Error handling
Empty corpus/query → a friendly "add a document first / no match" answer (not a crash). PDF extract failure → `''` → surfaced as "couldn't read that PDF". IPC validates bytes.

## 9. Risks & mitigations
- **Hallucinated facts** → answer is **extractive** (only document text); unit test asserts the answer text appears in the source.
- **Bad ranking** → TF-IDF unit test: the chunk containing the query terms ranks first.
- **pdf.js Node quirks** → use the `legacy` build (no DOM/worker); integration test extracts text from a PDF we generate with our pdf-lib adapter (round-trip).

## 10. ADRs
Reuses ADR-0004. No new ADR (a future `RetrievalPort` + DocNest adapter will get one).
