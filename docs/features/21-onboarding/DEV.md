# DEV — 21-onboarding (M11b)

## 1. Approach
`renderOnboarding(host, { settings?, onDone })` is a 4-step state machine (name → AI mode/key → search/key → finish) that collects a `draft` + key strings and, on Finish, `settings.set({ ...draft, onboarded:true })` + `setSecret` for any entered keys, then `onDone()`. `startApp(root)` (frontend) calls `bridge.firstRun()`; if true → `renderOnboarding(root, { onDone: () => mountShell(root) })`, else `mountShell(root)`. The desktop renderer entry calls `startApp` instead of `mountShell`.

## 2. Ports & seams
- Reuses the M11a `SettingsControl` (settings + secrets). New IPC `app:firstRun` (main) = `(app.isPackaged && !onboarded) || argv['--force-onboarding']`; bridge `firstRun()` (false without a host).

## 3. Flow
main `app:firstRun` decides → `startApp` branches → wizard writes settings/secrets → `onDone` mounts the shell. Step inputs update the draft live; Back/Next/Finish drive the machine; progress dots reflect the step.

## 4. Design patterns
- **State machine** (steps), **Builder** (draft), **Facade** (`startApp`), **DIP** (`SettingsControl` injected), least-privilege (keys via the encrypted secrets path).

## 5. External modules
None new. `app.isPackaged`/`argv` read in main only.

## 6. Risks & mitigations
- **Breaking existing e2e** → first-run is packaged-only; unpackaged dev/e2e always get the shell (zero spec edits). The wizard e2e uses `--force-onboarding`.
- **Lost input** → draft updated on each input; Finish persists once.

## 7. ADRs
None (reuses ADR-0008).
