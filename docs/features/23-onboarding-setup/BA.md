# BA — 23-onboarding-setup (M11d · Hardware check + Ollama/Shiva setup)

## 1. Problem & context
The onboarding (M11b) is redesigned to the **locked prototype**: name → **how Saathi should think** (with a **hardware check** that recommends a run mode) → embedding. The installer bundles **neither Ollama nor Shiva**; on first run Saathi **checks the machine**, and for offline modes **pulls the matching Shiva model — silently installing Ollama first if it's missing**.

## 2. Users & jobs-to-be-done
- Primary: a new user on their own machine. Job: "When I set up, Saathi should look at my computer, recommend the right local model, and get it running — without me wrestling with installs."

## 3. User stories
- **US-1**: As a user, onboarding **checks my RAM** and recommends Ultra-Lite (1.5B), Lite (7B), or Heavy (cloud).
- **US-2**: As a user, if I pick an offline mode, Saathi **pulls the Shiva model** (`shiva-nano:1.5b` / `shiva-chat:7b`), **installing Ollama first if needed**, with progress.
- **US-3**: As a user, if I pick Heavy, I add a **cloud key** (encrypted) instead.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN onboarding THEN it shows the detected RAM + the recommended mode. *(→ TC-23.2.1)*
- **AC-2** (US-2): GIVEN an offline mode WHEN I continue THEN `ollamaSetup(model)` runs with the right Shiva tag, reporting progress. *(→ TC-23.2.2)*
- **AC-3** (US-3): GIVEN Heavy THEN a cloud key step appears and stores the key encrypted. *(→ TC-23.2.3)*
- **AC-4** (architecture): hardware detection + Ollama detect/install/pull live in the **main process** only. *(→ review)*

## 5. Scope
- **In**: `hardwareInfo()` (RAM/cores → recommended mode); `ollamaStatus()` (API probe + binary check); `OllamaSetup` (download+silent-install Ollama if missing → `ollama pull <shiva>`, with progress); `system:*`/`ollama:*` IPC + `bridge.setupControl`; the redesigned 3-step onboarding (name → run-mode → embedding) + the setup/cloud-key finish; `runMode`/`embedding` added to settings.
- **Out**: GPU-based recommendation, model switching UI (Settings — M11e), non-Windows auto-install (guided), download resume.

## 6. Success metrics / done-signal
Onboarding shows the real RAM + recommended mode; offline finish pulls the Shiva model (installing Ollama if needed); Heavy stores a key.

## 7. Open questions / decisions for owner
- Offline auto-install is **Windows** (downloads the official `OllamaSetup.exe`, runs `/VERYSILENT`); other OSes get a guided message. Recommendation is RAM-based (≥8 GB → Lite).
