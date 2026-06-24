# QA — 22-packaging (M11c)

## 1. Risk assessment
| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Installer fails to build (workspace) | M | **H** | npmRebuild:false; @saathi→devDeps; verified build |
| Packaged app crashes on a feature | M | **H** | packaged smoke test (boot + Python) |
| Pyodide missing at runtime | M | **H** | asarUnpack pyodide; verified in win-unpacked |
| Auto-update crashes without a feed | L | M | packaged-only + try/catch |

## 2. Test approach
- **Build**: `npm run package` produces `Saathi-Setup-<v>.exe` + `win-unpacked/` (no errors).
- **Packaged smoke** (manual, the built binary): launch `win-unpacked/Saathi.exe` → onboarding → shell → run a Python snippet → output appears (Pyodide asar-unpack works).
- **Dev gates unaffected**: all 21 e2e still pass (unpackaged → no updater, no onboarding).

## 3. Exit criteria
- The installer builds; the packaged app boots and runs Python; `typecheck/lint/boundary/unit/e2e` all green; the `.exe` is ready to hand to the owner.

## 4. Notes
The installer is **unsigned** (SmartScreen warns on first run — "More info → Run anyway"). A signing cert + branded icon are follow-ups. The `release/` output is gitignored (build artifact, not committed).
