# BA — 21-onboarding (M11b · First-run wizard)

## 1. Problem & context
The packaged app's **first run** should feel welcoming, not boring: a short branded wizard that learns your **name**, how the AI should run (**offline Ollama/Shiva** or **cloud BYOK**), and an optional **web-search** provider + key — then hands off to the app. It writes into the M11a settings/secrets. First-run only triggers in a **packaged** build (dev/e2e get the shell), or when forced for testing.

## 2. Users & jobs-to-be-done
- Primary: a new user opening the installed app. Job: "When I first open Saathi, I want a friendly setup that gets me going in under a minute."

## 3. User stories
- **US-1**: As a new user, I'm asked **what to call me**.
- **US-2**: As a new user, I choose **offline or cloud** AI (and add a key for cloud).
- **US-3**: As a new user, I optionally pick a **search** provider + key.
- **US-4**: As a new user, finishing takes me into the app and won't ask again.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1–3): GIVEN the wizard WHEN I step through THEN my name, LLM mode, provider, and search choice are collected. *(→ TC-21.2.x)*
- **AC-2** (US-2/3): GIVEN a key WHEN I enter it THEN it's stored encrypted (via M11a secrets). *(→ TC-21.2.2)*
- **AC-3** (US-4): GIVEN Finish THEN settings are saved with `onboarded:true` and the app mounts. *(→ TC-21.2.1, TC-21.3.1)*
- **AC-4**: first-run only in a packaged build (or `--force-onboarding`); dev/e2e get the shell. *(→ main firstRun + e2e)*

## 5. Scope
- **In**: a `renderOnboarding` wizard (name → AI → search → done) writing via the settings/secrets bridge; `startApp` bootstrap that shows the wizard on first run else the shell; `app:firstRun` IPC (packaged-or-forced).
- **Out**: account/sign-in, model download, tours, themes-in-wizard (theme is the persisted skin).

## 6. Success metrics / done-signal
Launch (forced) → wizard → name/AI/search → Finish → the app appears; relaunch goes straight to the app.

## 7. Open questions
- Offline = local Ollama + Shiva (decided); keys optional during onboarding (can add later in Settings).
