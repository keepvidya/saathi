# QA — 08-chat

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| XSS via markdown / chat content | M | **H** | Renderer escapes; no raw HTML; link sanitising |
| Markdown renders incorrectly | M | M | Unit table (headings/bold/code/list/link) |
| Ollama down blocks chat | M | M | Adapter `''` + frontend Echo fallback |
| Conversation loses order | L | M | Unit Conversation |
| Send wiring broken | L | M | Frontend integration + e2e |

## 2. Test approach by level
- **Unit (domain)**: `markdownToHtml` cases (escape, bold, italic, inline code, fenced code, heading, list, link, sanitised link); `Conversation` ordering; `EchoChat` deterministic + references the user message.
- **Unit (backend)**: `OllamaChat.reply` with mocked `fetch` → text; non-200/throw → `''`.
- **Integration (frontend)**: Chat pane — sending appends a user bubble + a reply bubble; assistant bubble renders markdown; uses Echo when no host.
- **E2E**: launch → Chat (default) → type → send → a reply bubble appears.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 send + reply | — | TC-08.2.1 | TC-08.3.1 |
| AC-2 markdown safe | TC-08.1.1 | TC-08.2.1 | — |
| AC-3 history order | TC-08.1.2 | — | — |
| AC-4 offline + Ollama | TC-08.1.3 | (fallback) TC-08.2.1 | TC-08.1.4 |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M5b green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90%; lint/typecheck/boundary green; code + **visual review** (chat with user + markdown reply, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Message list: user bubbles (right/copper) + assistant bubbles (left); markdown rendered (bold/code/list)
- [ ] Composer with send; Enter sends
- [ ] Brand tokens light + dark
- [ ] Screenshots (chat light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33 (no Ollama → Echo fallback). Sample: a user message; a markdown reply string.
