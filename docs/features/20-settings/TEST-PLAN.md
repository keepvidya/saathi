# TEST PLAN — 20-settings (M11a)

- **Plan id**: TP-20
- **Items under test**: `@saathi/backend` `JsonSettings` (`SettingsPort`), `desktop/main` `SecretStore`, `settings:*`/`secret:*` IPC + bridge, the Settings pane.
- **Approach**: unit (backend) + integration (pane) + e2e.
- **Environment**: Win11, Node 22, Electron 33. **Entry/exit**: see QA.md.

---
## Suite TS-20.1 — JsonSettings (UNIT · backend, temp file)

### TC-20.1.1 — defaults / set / persist
| # | Action | Expected |
|---|---|---|
| 1 | `get()` on a fresh file | the defaults (`llmMode:'offline'`, `searchProvider:'none'`, `onboarded:false`, empty name) |
| 2 | `set({ userName:'Gunjan', llmMode:'cloud' })` | returns merged settings; other fields unchanged |
| 3 | a new instance on the same file | the saved values load |
| 4 | corrupt file | `get()` → defaults (no throw) |

---
## Suite TS-20.2 — Settings pane (INTEGRATION · injected ports)

### TC-20.2.1 — loads + saves non-secret settings
| # | Action | Expected |
|---|---|---|
| 1 | render Settings (stub returns a name + offline) | the name field + offline provider are populated |
| 2 | change the name | `settings.set` called with the new name |
| 3 | choose cloud | `settings.set({ llmMode:'cloud' })`; a key field appears |

### TC-20.2.2 — keys: set / presence / clear (never shown)
| # | Action | Expected |
|---|---|---|
| 1 | the LLM key field shows "set" when `secrets.has` is true; the value is never rendered | presence only |
| 2 | type a key + Save | `secrets.set(SECRET_LLM, value)` called; field flips to "set" |
| 3 | Remove | `secrets.clear(SECRET_LLM)` called; field shows "not set" |

---
## Suite TS-20.3 — Flow (E2E · Playwright-Electron)

### TC-20.3.1 — Settings round-trip
| # | Action | Expected |
|---|---|---|
| 1 | launch → Settings; set a name; choose cloud; save a key | the key field shows "set ✓"; clearing returns it to "not set" (light + dark screenshots) |

---
## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-20.1.1, TC-20.2.1, TC-20.3.1 |
| AC-2 | TC-20.1.1, TC-20.2.1 |
| AC-3 | TC-20.2.2, TC-20.3.1 |
| AC-4 | TC-20.1.1 |
