# DEV — 23-onboarding-setup (M11d)

## 1. Approach
Main-process `system-setup.ts`: `hardwareInfo()` (os.totalmem/cpus → `recommend` ≥8 GB ⇒ Lite else Ultra-Lite); `ollamaStatus()` (probe `localhost:11434/api/tags`, else `where/which ollama`); `OllamaSetup` (if Ollama missing on Windows → fetch `OllamaSetup.exe` + run `/VERYSILENT`; then `ollama pull <model>`, parsing `%` from stderr) with an `onProgress` callback pushed over IPC. The renderer never touches child_process/network. The onboarding (`onboarding.ts`) is the locked 3-step (name → run-mode with the hardware line + recommendation → embedding) + a finish step: offline ⇒ a progress screen driving `ollama:setup(SHIVA_MODELS[mode])`; heavy ⇒ a cloud-key field. Settings gain `runMode` + `embedding`.

## 2. Ports & seams
- IPC: `system:hardware`, `ollama:status`, `ollama:setup` (+ `ollama:setupProgress` push). `bridge.setupControl` (host or offline default). `SHIVA_MODELS` (`@saathi/shared`): ultra→`shiva-nano:1.5b`, lite→`shiva-chat:7b`.

## 3. Design patterns
- **Adapter/Facade** (`OllamaSetup` over the OS), **Observer** (setup progress push), **State machine** (wizard steps), **Strategy** (RAM-based recommendation; offline-vs-cloud finish), **least-privilege** (install/network in main only).

## 4. External modules (Wrapper Rule)
None — Node `os`/`child_process`/`fetch` in `desktop/main` only.

## 5. Risks & mitigations
- **Heavy live install (GBs)** → built + unit-tested with a mocked `SetupControl`; the real install runs only on the user's machine (the e2e uses the Heavy path to avoid it).
- **Setup failure** → `SetupProgress {phase:'error'}` message, never a crash; the user can still enter the app.
- **Non-Windows** → guided "install from ollama.com" message.

## 6. ADRs
None (reuses ADR-0008 for keys).
