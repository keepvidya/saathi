/**
 * Knowledge / RAG core — pure, deterministic, offline.
 *
 * DNA: retrieval + the cited answer are computed by OUR code. No facts are
 * invented — `composeAnswer` only ever returns text that appears verbatim in
 * the source documents, with a `[n]` citation back to the document it came
 * from. A model may later *rephrase* the extractive answer behind a port, but
 * the grounding path here never calls an LLM.
 *
 * Design: Repository (`Corpus`) + Strategy (`retrieve` — a lexical TF-IDF
 * retriever, swappable later for embeddings / DocNest behind a RetrievalPort).
 */

/** A document the user added to their knowledge base. */
export interface KnowledgeDoc {
  id: string
  title: string
  text: string
}

/** A retrievable passage, carrying its source document's identity. */
export interface Chunk {
  docId: string
  docTitle: string
  index: number
  text: string
}

/** A retrieved chunk with its relevance score. */
export interface Hit {
  chunk: Chunk
  score: number
}

/** A numbered citation back to a source document. */
export interface Citation {
  n: number
  docTitle: string
  snippet: string
}

/** A grounded answer: extractive text + the citations that support it. */
export interface Answer {
  answer: string
  citations: Citation[]
}

/** Lowercase word tokens. Pure; shared by chunk indexing and query scoring. */
function tokenize(s: string): string[] {
  return s.toLowerCase().match(/[a-z0-9]+/g) ?? []
}

/** Sentence-ish split, keeping terminal punctuation out of the pieces. */
function splitSentences(text: string): string[] {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

/** Clip a snippet to `max` chars on a word boundary, with an ellipsis. */
function clip(s: string, max = 140): string {
  const t = s.trim()
  if (t.length <= max) return t
  const cut = t.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trimEnd() + '…'
}

/**
 * Split text into retrievable chunks. Paragraphs are the natural unit; a
 * paragraph longer than `size` is further split on sentence boundaries so no
 * single chunk dominates. O(n).
 */
export function chunkText(text: string, size = 600): string[] {
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter((p) => p.length > 0)

  const chunks: string[] = []
  for (const para of paragraphs) {
    if (para.length <= size) {
      chunks.push(para)
      continue
    }
    // Long paragraph: pack sentences up to `size`.
    let buf = ''
    for (const sentence of splitSentences(para)) {
      if (buf && buf.length + 1 + sentence.length > size) {
        chunks.push(buf)
        buf = sentence
      } else {
        buf = buf ? `${buf} ${sentence}` : sentence
      }
    }
    if (buf) chunks.push(buf)
  }
  return chunks
}

/** A repository of documents, chunked for retrieval. */
export class Corpus {
  private readonly docs: KnowledgeDoc[] = []
  private readonly chunkList: Chunk[] = []

  add(doc: KnowledgeDoc): void {
    this.docs.push(doc)
    const pieces = chunkText(doc.text)
    pieces.forEach((text, index) => {
      this.chunkList.push({ docId: doc.id, docTitle: doc.title, index, text })
    })
  }

  docList(): KnowledgeDoc[] {
    return [...this.docs]
  }

  chunks(): Chunk[] {
    return [...this.chunkList]
  }

  size(): number {
    return this.chunkList.length
  }
}

/**
 * Lexical TF-IDF retrieval. Document frequency is computed across all chunks;
 * a chunk's score is Σ over query terms of tf · idf, where
 *   tf  = (term count in chunk) / (chunk length)
 *   idf = ln((N + 1) / (df + 1)) + 1   (smoothed, always positive)
 * Chunks scoring 0 are dropped. Returns the top `k` by score, descending.
 */
export function retrieve(corpus: Corpus, query: string, k = 4): Hit[] {
  const queryTerms = tokenize(query)
  if (queryTerms.length === 0) return []

  const chunks = corpus.chunks()
  const n = chunks.length
  if (n === 0) return []

  // Per-chunk token lists + document frequency for query terms.
  const tokensByChunk = chunks.map((c) => tokenize(c.text))
  const queryTermSet = new Set(queryTerms)
  const df = new Map<string, number>()
  tokensByChunk.forEach((tokens) => {
    const seen = new Set<string>()
    for (const tok of tokens) {
      if (queryTermSet.has(tok) && !seen.has(tok)) {
        seen.add(tok)
        df.set(tok, (df.get(tok) ?? 0) + 1)
      }
    }
  })

  const hits: Hit[] = []
  chunks.forEach((chunk, i) => {
    const tokens = tokensByChunk[i]
    const len = tokens.length
    if (len === 0) return
    const counts = new Map<string, number>()
    for (const tok of tokens) {
      if (queryTermSet.has(tok)) counts.set(tok, (counts.get(tok) ?? 0) + 1)
    }
    let score = 0
    for (const term of queryTermSet) {
      const tf = (counts.get(term) ?? 0) / len
      if (tf === 0) continue
      const idf = Math.log((n + 1) / ((df.get(term) ?? 0) + 1)) + 1
      score += tf * idf
    }
    if (score > 0) hits.push({ chunk, score })
  })

  hits.sort((a, b) => b.score - a.score)
  return hits.slice(0, k)
}

/** The sentence in `text` with the most overlap with the query terms. */
function bestSnippet(text: string, queryTerms: Set<string>): string {
  const sentences = splitSentences(text)
  if (sentences.length === 0) return text.trim()
  let best = sentences[0]
  let bestOverlap = -1
  for (const sentence of sentences) {
    let overlap = 0
    for (const tok of tokenize(sentence)) {
      if (queryTerms.has(tok)) overlap++
    }
    if (overlap > bestOverlap) {
      bestOverlap = overlap
      best = sentence
    }
  }
  return best
}

/**
 * Compose a grounded, extractive answer. The answer text is the best-matching
 * sentence from the top hit — verbatim document text, never invented — with a
 * `[1]` marker; `citations` number each hit back to its source document.
 * Empty hits → a friendly, citation-free message (no crash).
 */
export function composeAnswer(query: string, hits: Hit[]): Answer {
  if (hits.length === 0) {
    return {
      answer:
        "I couldn’t find anything about that in your documents. Try adding a document, or rephrasing the question.",
      citations: [],
    }
  }

  const queryTerms = new Set(tokenize(query))
  const lead = clip(bestSnippet(hits[0].chunk.text, queryTerms))
  const answer = `Based on your documents: ${lead} [1]`

  const citations: Citation[] = hits.map((hit, i) => ({
    n: i + 1,
    docTitle: hit.chunk.docTitle,
    snippet: clip(hit.chunk.text),
  }))

  return { answer, citations }
}
