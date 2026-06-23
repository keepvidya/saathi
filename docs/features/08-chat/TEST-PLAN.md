# TEST PLAN — 08-chat

- **Plan id**: TP-08
- **Items under test**: `@saathi/domain` (`markdownToHtml`, `Conversation`, `EchoChat`), `@saathi/backend` `OllamaChat`, frontend Chat pane + `CompositeChat`, `chat:reply` IPC
- **Approach**: unit (domain + backend) + integration (frontend) + e2e.
- **Environment**: Win11, Node 22, Electron 33 (no Ollama → Echo). **Entry/exit**: see QA.md.

---
## Suite TS-08.1 — Chat core (UNIT · domain + backend)

### TC-08.1.1 — markdownToHtml renders & escapes
| # | Action | Expected |
|---|---|---|
| 1 | `**bold**` / `*it*` / `` `c` `` | `<strong>bold</strong>` / `<em>it</em>` / `<code>c</code>` |
| 2 | `# Title` / `- a` (lines) | `<h1>Title</h1>` / `<ul><li>a</li></ul>` |
| 3 | fenced ```` ```\ncode\n``` ```` | `<pre><code>code</code></pre>` |
| 4 | `[t](https://x.com)` | `<a href="https://x.com">t</a>` |
| 5 | `<script>alert(1)</script>` | escaped (`&lt;script&gt;`); no raw `<script>` |
| 6 | `[t](javascript:alert(1))` | NOT a link (unsafe URL dropped) |

### TC-08.1.2 — Conversation keeps order
| # | Action | Expected |
|---|---|---|
| 1 | addUser('a'); addAssistant('b'); addUser('c') | `list()` = roles user,assistant,user with those contents |

### TC-08.1.3 — EchoChat is deterministic & references the user
| # | Action | Expected |
|---|---|---|
| 1 | `EchoChat.reply([{role:'user',content:'Hello world'}])` twice | identical; mentions `Hello world` |

### TC-08.1.4 — OllamaChat behind the port (backend)
| # | Action | Expected |
|---|---|---|
| 1 | mocked `fetch` → `{message:{content:'hi'}}` | returns `'hi'` |
| 2 | non-200 / throws | returns `''` |

---
## Suite TS-08.2 — Chat pane (INTEGRATION · frontend)

### TC-08.2.1 — Send appends user + reply; markdown rendered
| # | Action | Expected |
|---|---|---|
| 1 | render Chat; type 'Hello'; send (no host → Echo) | a `.msg.user` with 'Hello' then a `.msg.bot` reply appears |
| 2 | the bot bubble | renders markdown (contains an element, e.g. `<strong>`/`<code>`, not raw `**`) |

---
## Suite TS-08.3 — Flow (E2E · Playwright-Electron)

### TC-08.3.1 — Chat send → reply
| # | Action | Expected |
|---|---|---|
| 1 | launch (Chat is default); type a message; press Enter | the message + a reply bubble appear |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-08.2.1, TC-08.3.1 |
| AC-2 | TC-08.1.1, TC-08.2.1 |
| AC-3 | TC-08.1.2 |
| AC-4 | TC-08.1.3, TC-08.1.4 |
