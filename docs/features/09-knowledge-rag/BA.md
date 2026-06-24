# BA — 09-knowledge-rag

## 1. Problem & context
Users want to **ask their own documents** — locally, privately, with answers they can trust. Knowledge ingests documents (pasted text + PDFs), retrieves the most relevant passages, and composes a **grounded, cited** answer. Per our DNA, **retrieval + the cited answer are computed by our code** (no invented facts); a model may rephrase later. (Production swaps our retriever for the in-house **DocNest + Knovex** behind the same port.)

## 2. Users & jobs-to-be-done
- Primary: anyone with documents (a report, notes, a PDF). Job: "When I ask about my documents, I want a correct answer that shows where it came from."

## 3. User stories
- **US-1**: As a user, I add a document (paste text, or upload a **PDF**) to my knowledge base.
- **US-2**: As a user, I ask a question and get an answer drawn from my documents.
- **US-3**: As a user, the answer **cites** the source passages, so I can verify it.
- **US-4**: As a user, it works **offline** — no facts are invented; answers come from my text.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN text/PDF WHEN ingested THEN it becomes searchable chunks; a PDF's text is extracted. *(→ TC-09.1.1, TC-09.2.1)*
- **AC-2** (US-2): GIVEN a corpus WHEN I query THEN the most relevant chunks rank first (lexical TF-IDF). *(→ TC-09.1.2)*
- **AC-3** (US-3): GIVEN retrieved chunks THEN the answer is **extractive + cited** (quotes the top passage with a `[n]` citation back to its document). *(→ TC-09.1.3, TC-09.2.2)*
- **AC-4** (US-4): The retrieval + answer are **deterministic** and contain only text present in the documents (no hallucination). *(→ TC-09.1.3)*

## 5. Scope
- **In**: a pure RAG engine — chunking, a lexical **retriever** (TF-IDF over a `Corpus`), and an **extractive cited-answer composer** (`@saathi/domain`); a **PDF text-extraction** adapter (`@saathi/backend`, pdf-parse) + `pdf:extractText` IPC; a **Knowledge pane** (add text/PDF, doc list, ask → answer + citations) in `@saathi/frontend`.
- **Out**: vector/semantic embeddings, the DocNest+Knovex integration (a later swap behind `RetrievalPort`), LLM-rephrased answers (the extractive answer is the deterministic core), OCR, docx/xlsx ingest, persistence, a PDF *viewer*.

## 6. Success metrics / done-signal
Add a doc (or PDF), ask a question, get a correct **extractive answer with a citation** to the source — deterministically, offline.

## 7. Open questions
- None. Semantic embeddings + DocNest/Knovex are tracked as a retriever swap behind the port.
