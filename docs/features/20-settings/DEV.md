# DEV — 20-settings (M11a)

## 1. Approach
Split secret vs non-secret. **Non-secret** `AppSettings` (name, llmMode, cloudProvider, searchProvider, onboarded) → `SettingsPort` + `JsonSettings` (`@saathi/backend`, JSON file, unit-tested). **Secrets** (cloud LLM key, search key) → `SecretStore` (`desktop/main`, `safeStorage`) — encrypted at rest, **set/has/clear over IPC, never get** (ADR-0008). The Settings pane reads settings + key-presence and writes via `bridge.settings` / `bridge.secrets`; appearance reuses the existing skin system.

## 2. Ports & seams
- `SettingsPort { get(): AppSettings; set(patch: Partial<AppSettings>): AppSettings }` (backend).
- `SecretStore` (main): `setSecret(name,value)`, `hasSecret(name): boolean`, `clearSecret(name)`, `getSecret(name): string|null` (main-only, **not** exposed).
- **IPC**: `settings:get`, `settings:set`; `secret:set`, `secret:has`, `secret:clear`. No `secret:get`.
- Bridge: `settings.{get,set}`, `secrets.{set,has,clear}`.

## 3. Model
- `AppSettings { userName; llmMode:'offline'|'cloud'; cloudProvider; searchProvider:'none'|'serper'|'brave'; onboarded }` + `defaultSettings()` (`@saathi/shared` type; defaults in the adapter). Secret names: `SECRET_LLM`, `SECRET_SEARCH` (`@saathi/shared`).

## 4. Design patterns
- **Adapter** (`JsonSettings`, `SecretStore`), **Repository**, **Facade** (`bridge.settings`/`secrets`), **least-privilege** (renderer can't read keys), **Strategy** (skin/theme reused).

## 5. External modules (Wrapper Rule)
- `safeStorage` is Electron → only `desktop/main/secret-store.ts` imports it (composition root). No npm vendor.

## 6. Flow
Settings mount → `bridge.settings.get()` + `bridge.secrets.has(name)` per key → render. Change a field → `settings.set(patch)`. Save a key → `secrets.set(name, value)` (main encrypts) → re-check `has` → show "set ✓". Clear → `secrets.clear(name)`.

## 7. Error handling
`safeStorage` unavailable → store tagged `raw:` (base64, not encrypted) so the app still works; surfaced as not-encrypted. Corrupt files → defaults / empty. Empty key → no-op.

## 8. Risks & mitigations
- **Key leak to renderer** → no `secret:get` IPC; plaintext only in main.
- **Encryption unavailable (CI/Linux)** → graceful raw fallback; e2e tests the set/has/clear contract, not the on-disk ciphertext.

## 9. ADRs
**ADR-0008** — encrypted secrets via `safeStorage`; renderer never reads keys.
