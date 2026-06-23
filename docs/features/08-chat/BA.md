# BA — 08-chat

## 1. Problem & context
Chat is Saathi's front door (the default pane) — today a stub. Users want a **local AI chat**: type a message, get a markdown-rendered reply, keep the conversation. It runs on **local Ollama** when available and on a **deterministic offline reply** otherwise, so it always works and never phones home.

## 2. Users & jobs-to-be-done
- Primary: anyone wanting quick local AI help. Job: "When I ask something, I want a useful, readable reply — on my machine, no account."

## 3. User stories
- **US-1**: As a user, I type a message and see it in the conversation, then get a reply.
- **US-2**: As a user, replies render **markdown** (headings, bold/italic, code, lists, links) safely.
- **US-3**: As a user, my conversation persists while the app is open (in-session history).
- **US-4**: As a user, it works offline (deterministic reply) and uses Ollama when running.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the Chat pane WHEN I send a message THEN it appears as a user bubble and a reply bubble follows. *(→ TC-08.2.1, TC-08.3.1)*
- **AC-2** (US-2): GIVEN reply text with markdown THEN it renders to safe HTML (escaped; `**b**`→`<strong>`, `` `c` ``→`<code>`, `# h`→heading, `- x`→list, `[t](u)`→link). *(→ TC-08.1.1)*
- **AC-3** (US-3): GIVEN several messages THEN the conversation keeps them in order. *(→ TC-08.1.2)*
- **AC-4** (US-4): GIVEN no Ollama THEN a deterministic reply is produced; an **Ollama chat adapter** exists behind the port. *(→ TC-08.1.3, TC-08.1.4 backend)*

## 5. Scope
- **In**: a pure `ChatPort` + `EchoChat` (offline) + `Conversation` model + a minimal **markdown→HTML** renderer (`@saathi/domain`); an **Ollama chat adapter** (`@saathi/backend`) + `chat:reply` IPC; the **Chat pane** (message list + composer + markdown render, `CompositeChat` = Ollama→Echo fallback) in `@saathi/frontend`.
- **Out**: streaming tokens, multiple saved conversations/persistence, BYOK cloud providers, tool-use/RAG-grounded chat, model picker (later milestones).

## 6. Success metrics / done-signal
Type a message in Chat → it shows, a markdown-rendered reply follows; conversation persists in-session; works offline; uses Ollama when present.

## 7. Open questions
- None. Streaming, saved conversations, and BYOK are tracked for later.
