# BA — 15-browser (M9a · Browser core)

## 1. Problem & context
A local-first workspace should let you **browse the web without leaving it** — and on your terms. M9a is the browser walking skeleton: real **multi-tab** browsing with back/forward/reload and a combined **address + search** bar, built on Electron's secure **WebContentsView** (web content runs in the main process, never in our renderer). The deterministic core — the **tab model** and the **address-vs-search decision** — is *our code*. (M9b adds **Shields**: ad/tracker blocking.)

## 2. Users & jobs-to-be-done
- Primary: anyone who wants to look something up mid-task. Job: "When I need the web, I want tabs, navigation, and a smart address bar inside Saathi, privately."

## 3. User stories
- **US-1**: As a user, I open, switch, and close **tabs**.
- **US-2**: As a user, I type a **URL or a search** in one bar — Saathi figures out which and goes there.
- **US-3**: As a user, I go **back / forward / reload**; the address + tab title reflect the current page.
- **US-4**: As a user, web pages run in a **sandboxed** view, isolated from the app (security).

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-2): GIVEN address input THEN our parser classifies it as a URL (normalised, scheme added) or a search (built into a search URL), deterministically. *(→ TC-15.1.1)*
- **AC-2** (US-1): GIVEN the tab model THEN open/activate/close/update behave correctly; closing the active tab activates a neighbour; the set is never left without an active tab while tabs remain. *(→ TC-15.1.2)*
- **AC-3** (US-1/3): GIVEN the Browser pane WHEN I open a tab and navigate to a page THEN the tab title + address bar update; new/close/switch work. *(→ TC-15.3.1)*
- **AC-4** (US-4): Web content runs in a **WebContentsView** with `contextIsolation`, `sandbox`, no `nodeIntegration`; external `window.open` opens a new in-app tab, not a popup. *(→ main wiring + e2e)*

## 5. Scope
- **In**: a pure **tab model** (`TabSet`) + **address/search parser** (`@saathi/domain/browser`); a **WebContentsView**-based multi-tab host in the main process (new/close/switch/navigate/back/forward/reload + title/url/loading/nav-state events + bounds) with a typed IPC; the **Browser pane** (tab strip, toolbar, address bar, content region that reports its bounds; show/hide as the pane mounts/leaves).
- **Out** (→ later): **Shields ad/tracker blocking (M9b)**, SearXNG-instance search, history/bookmarks/downloads, devtools, find-in-page, agent-drive (gated), per-site permissions UI.

## 6. Success metrics / done-signal
Open Browser, type a query → search; type a domain → navigate; open a second tab, switch, close; back/forward/reload work; address + titles stay correct; content is sandboxed.

## 7. Open questions / decisions for owner
- Default search engine: **DuckDuckGo** (privacy-respecting) via the parser; configurable later (incl. a self-hosted SearXNG). Shields lands in M9b.
