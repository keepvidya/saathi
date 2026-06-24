# QA — 15-browser (M9a)

## 1. Risk assessment
| Risk | Likelihood | Impact | Test focus |
|---|---|---|---|
| Address misclassified (URL vs search) | M | M | `parseAddress` unit (many cases) |
| Tab state corrupts (close active, last tab) | M | **H** | `TabSet` unit |
| View not positioned / overlaps other panes | M | M | bounds + show/hide; e2e + visual |
| Web content escapes sandbox | L | **H** | secure WebContentsView prefs (review) |
| Popups / `window.open` abuse | M | M | window-open → new tab (deny popup) |

## 2. Test approach by level
- **Unit (domain)**: `parseAddress` — schemes, bare domains, localhost/IP, queries, empty; `TabSet` — open/activate/update, close active→neighbour, close last→still valid, ids unique.
- **Integration (frontend)**: the Browser pane renders a tab strip + toolbar + address bar; typing + Enter calls `browser:navigate`; an injected event updates the tab title + address + nav buttons; new/close/switch call the right IPC. (WebContentsView is mocked via an injected browser port.)
- **E2E**: open Browser → new tab → navigate to a `data:` URL with a known `<title>` → the tab title + address reflect it; open a second tab, switch, close. (No external network.)
- **Security review**: WebContentsView webPreferences locked down; `setWindowOpenHandler` denies popups / opens tabs.

## 3. Coverage matrix
| AC | Unit | Integration | E2E |
|---|---|---|---|
| AC-1 address parse | TC-15.1.1 | TC-15.2.1 | — |
| AC-2 tab model | TC-15.1.2 | TC-15.2.2 | TC-15.3.1 |
| AC-3 pane round-trip | — | TC-15.2.1/2 | TC-15.3.1 |
| AC-4 sandbox | — | — | review + e2e |

## 4. Entry / exit criteria
- **Entry**: BA+DEV approved; M8e green.
- **Exit (Done)**: all TCs pass; domain coverage ≥90% (global gate); lint/typecheck/boundary green; code + **visual review** (tabs + address + a loaded page, light + dark); screenshots committed.

## 5. Visual review checklist
- [ ] Tab strip (active tab, new-tab, close); toolbar (back/forward/reload); address bar
- [ ] A page loaded in the content region, correctly positioned (no overlap)
- [ ] Brand tokens light + dark
- [ ] Screenshots (browser light + dark) committed

## 6. Test environment & data
Win11, Node 22, Electron 33. Fixtures: address cases; an injected browser port for the pane; a `data:text/html` page with a `<title>` for the e2e.
