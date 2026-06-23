# DEV — 08-chat

## 1. Approach
Pure chat core in `@saathi/domain`: `ChatPort` (the chat seam), a deterministic `EchoChat`, a `Conversation` model, and a minimal **safe markdown→HTML** renderer (escape-first; reusable by Learn later). `@saathi/backend` adds an **Ollama chat adapter** (`fetch` `/api/chat`, `''` on failure) behind `ChatPort` + a `chat:reply` IPC. `@saathi/frontend` renders the Chat pane (message list + composer) using a `CompositeChat` (Ollama via the bridge → `EchoChat` fallback) and `markdownToHtml` for assistant bubbles. Narrator note: here the LLM IS the product (it talks), but offline we still answer deterministically.

## 2. Ports touched
- **`ChatPort`** (domain): `reply(messages: ChatMessage[]): Promise<string>` — implemented by `EchoChat` (domain), `OllamaChat` (backend), `CompositeChat` (frontend).
- **IPC**: `chat:reply` (renderer → main → Ollama; `''` on failure → caller falls back).

## 3. Domain model
- `ChatMessage { role: 'user'|'assistant'; content: string }`; `Conversation` (ordered messages; `addUser/addAssistant/list`).
- `markdownToHtml(md): string` — escapes `& < >`, then: fenced ``` code blocks, inline `code`, `**bold**`, `*italic*`, `# / ##` headings, `- ` lists, `[text](http…)` links (URL-validated), paragraphs / line breaks. No raw HTML passthrough (XSS-safe).

## 4. Data structures & complexity (DSA)
| Operation | Time | Notes |
|---|---|---|
| Render markdown | O(n) chars | line scan + bounded inline regex passes |
| Append message | O(1) | push to array |
| Build reply (Echo) | O(n) | templated over last user msg |

## 5. Design patterns
- **Dependency Inversion** (`ChatPort`), **Adapter** (Ollama), **Composite/Chain** (Ollama→Echo), **Facade** (chat controller), **Strategy** (markdown block handlers).

## 6. External modules (Wrapper Rule)
| Vendor | Wrapped by | Port | Notes |
|---|---|---|---|
| **Ollama** (HTTP) | `backend/adapters/ollama/ollama-chat.adapter.ts` via `fetch` | `ChatPort` | no npm dep; IO isolated. Markdown is hand-rolled (no markdown-it dep yet). |

## 7. Flow / sequence
Chat pane: send → `conversation.addUser(text)` → render → `CompositeChat.reply(messages)` → `conversation.addAssistant(reply)` → render (`markdownToHtml` for assistant). `CompositeChat.reply` → `bridge.chatReply(messages)` (IPC → main → `OllamaChat`); empty/throws → `EchoChat`.

## 8. Error handling
LLM failure → `''` → deterministic `EchoChat` (never blocks). Markdown renderer escapes everything and validates link URLs (only `http(s)`/relative). IPC validates `messages` is an array.

## 9. Risks & mitigations
- **XSS via markdown/chat content** → escape-first renderer; unit tests assert no raw `<script>`, links sanitised.
- **Ollama down** → `EchoChat` fallback; covered by adapter + frontend tests.
- **Renderer correctness** → table of markdown unit cases (headings/bold/code/list/link/escape).

## 10. ADRs
Reuses ADR-0004. No new ADR.
