# TEST PLAN — 15-browser (M9a)

- **Plan id**: TP-15
- **Items under test**: `@saathi/domain/browser` (`parseAddress`, `TabSet`), main `BrowserTabs` (WebContentsView) + browser IPC, the Browser pane.
- **Approach**: unit (domain) + integration (pane) + e2e + security review.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-15.1 — Domain (UNIT)

### TC-15.1.1 — parseAddress classifies URL vs search
| # | Input | Expected |
|---|---|---|
| 1 | `https://example.com` | `{ kind:'url', url:'https://example.com' }` |
| 2 | `example.com` | `url` `https://example.com` |
| 3 | `localhost:5173` | `url` `https://localhost:5173` |
| 4 | `how do magnets work` | `search`, url contains the encoded query |
| 5 | `` (empty) | `url` `about:blank` |
| 6 | `127.0.0.1:8080` | `url` `https://127.0.0.1:8080` |

### TC-15.1.2 — TabSet state machine
| # | Action | Expected |
|---|---|---|
| 1 | `open(a); open(b)` | 2 tabs, active = b, unique ids |
| 2 | `update(a,{title:'A'})` | tab a title = 'A' |
| 3 | `close(b)` (active) | active falls back to a |
| 4 | close the last tab | `count()===0`, `active()===undefined` (host opens a fresh tab) |

---
## Suite TS-15.2 — Browser pane (INTEGRATION · injected browser port)

### TC-15.2.1 — address bar drives navigate
| # | Action | Expected |
|---|---|---|
| 1 | render Browser (stub port); type `example.com` + Enter | port `navigate` called with the active id + `example.com` |
| 2 | a `browser:event` with a titled tab | the tab strip + address bar reflect title/url; back/forward disabled per state |

### TC-15.2.2 — tab controls
| # | Action | Expected |
|---|---|---|
| 1 | click ＋ | `newTab` called |
| 2 | click a tab's ✕ | `closeTab` called with its id |
| 3 | click another tab | `activate` called with its id |
| 4 | click ← / → / ⟳ | `back` / `forward` / `reload` called for the active id |

---
## Suite TS-15.3 — Flow (E2E · Playwright-Electron)

### TC-15.3.1 — open, navigate, multi-tab
| # | Action | Expected |
|---|---|---|
| 1 | launch → Browser; navigate to a `data:` page titled "Hello Saathi" | the active tab title + address update |
| 2 | new tab → switch → close | tab strip updates correctly (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-15.1.1, TC-15.2.1 |
| AC-2 | TC-15.1.2, TC-15.2.2, TC-15.3.1 |
| AC-3 | TC-15.2.1/2, TC-15.3.1 |
| AC-4 | security review + TC-15.3.1 |
