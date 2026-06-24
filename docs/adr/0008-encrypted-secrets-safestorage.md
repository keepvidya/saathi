# ADR-0008 — Encrypted secrets via safeStorage; renderer never reads keys

- **Status**: Accepted
- **Date**: 2026-06-24
- **Relates to**: M11a Settings, the Electron security baseline

## Context
BYOK keys (cloud LLM key, web-search key — Serper/Brave) must be stored **encrypted at rest**, and the app's privacy DNA means a compromised renderer should never be able to exfiltrate a key.

## Decision
- **Encrypt at rest with Electron `safeStorage`** (OS-backed: Windows DPAPI, macOS Keychain, Linux libsecret). The encrypted blobs live in a file in `userData`. Where OS encryption is unavailable (some headless Linux/CI), fall back to a non-encrypted (base64, tagged `raw:`) store so the app still works — and surface that it isn't encrypted. On the user's Windows target, it is always DPAPI-encrypted.
- **`SecretStore` lives in `desktop/main`** (the only file importing `safeStorage`) — the composition root, like the ad-block wrapper.
- **The renderer can `set` / `has` / `clear` a secret, but never `get` it.** Plaintext keys exist only in the main process, used there when calling provider APIs. The Settings UI shows "key set ✓" / lets you replace or remove — it never displays the key.
- **Non-secret settings** (name, LLM mode, search provider, onboarded flag) are a plain JSON file behind a `SettingsPort` in `@saathi/backend` (electron-free, unit-tested).

## Consequences
- A compromised renderer can toggle presence but cannot read keys.
- Provider integrations (cloud LLM, web search) read keys in main via `SecretStore.getSecret`, never over IPC.
- `safeStorage` is electron-only → `SecretStore` is e2e-tested (set/has/clear contract); the JSON `SettingsPort` is unit-tested in Node.
