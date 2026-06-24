# BA — 20-settings (M11a · Settings + encrypted keys)

## 1. Problem & context
Saathi needs a **Settings** surface (Knovex-style): who you are, your AI provider (offline Ollama/Shiva or a cloud BYOK key), web-search provider + key, appearance, and about. **API keys are stored encrypted** (`safeStorage`) and the renderer can never read them back (ADR-0008). This is also the config the onboarding wizard (M11b) writes into.

## 2. Users & jobs-to-be-done
- Primary: the owner of the app. Job: "When I set up Saathi, I want to choose offline or cloud AI, add my keys safely, set my name and theme — and trust my keys are encrypted."

## 3. User stories
- **US-1**: As a user, I set my **name** and **theme**.
- **US-2**: As a user, I choose **offline (Ollama/Shiva)** or **cloud**, and for cloud I save an **API key**.
- **US-3**: As a user, I pick a **search provider** (None / Serper / Brave) and save its key.
- **US-4**: As a user, my **keys are encrypted** and never shown back; I can replace or remove them.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN Settings WHEN I change my name THEN it's saved (non-secret JSON). *(→ TC-20.1.1, TC-20.2.1)*
- **AC-2** (US-2/3): GIVEN a provider choice THEN it's saved; the matching key field appears. *(→ TC-20.2.1)*
- **AC-3** (US-4): GIVEN a key WHEN I save it THEN it's stored **encrypted** and only its **presence** is shown (never the value); clearing removes it. *(→ TC-20.2.2, TC-20.3.1)*
- **AC-4**: settings persist across restarts; defaults apply on first run. *(→ TC-20.1.1)*

## 5. Scope
- **In**: an `AppSettings` model + a `SettingsPort`/`JsonSettings` (non-secret JSON, `@saathi/backend`); a `SecretStore` (`desktop/main`, `safeStorage`, set/has/clear — never get over IPC); `settings:*` + `secret:*` IPC + bridge; a real **Settings pane** (Profile, AI provider, Search, Appearance, About).
- **Out** (later): the onboarding wizard (M11b), packaging (M11c), actually *using* the keys (cloud LLM / web search calls), key rotation, import/export.

## 6. Success metrics / done-signal
Open Settings, set your name + theme, choose offline or cloud + save a key (encrypted, shown only as "set"), pick a search provider — and it all persists.

## 7. Open questions / decisions for owner
- Offline = local Ollama + Shiva (decided). Cloud-provider list starts minimal (e.g. OpenAI/Anthropic); extendable.
