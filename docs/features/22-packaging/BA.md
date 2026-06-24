# BA — 22-packaging (M11c · Installer + auto-update)

## 1. Problem & context
To test Saathi as a real app, it must be a **Windows installer** (`.exe`) — installable, launchable, and updatable. M11c packages the app with **electron-builder** (NSIS) and scaffolds **electron-updater** (the release feed is wired by CI in M12). The build must **asar-unpack Pyodide** so runnable Python works in the installed app.

## 2. Users & jobs-to-be-done
- Primary: the owner testing the app; later, any user installing it. Job: "Download an installer, run it, and use Saathi — with future versions updating themselves."

## 3. User stories
- **US-1**: As a user, I get a **Saathi-Setup.exe** that installs the app (choose the folder, Start-menu shortcut).
- **US-2**: As a user, runnable Python and all features work in the installed app.
- **US-3**: As the team, the app can **auto-update** from a published release feed (enabled in M12).

## 4. Acceptance criteria
- **AC-1**: `npm run package` produces a working NSIS installer `.exe`. *(verified by building)*
- **AC-2**: the packaged app boots, shows onboarding (first run), mounts the shell, and **runs Python** (Pyodide asar-unpacked). *(verified by a packaged smoke test)*
- **AC-3**: `electron-updater` is wired (packaged-only, guarded); the GitHub release feed is configured. *(M12 publishes releases)*

## 5. Scope
- **In**: `electron-builder.yml` (NSIS, `electronVersion` pin, `npmRebuild:false`, asar-unpack Pyodide, GitHub publish config); `package` scripts; `electron-updater` `checkForUpdatesAndNotify` in main (packaged-only); `@saathi/*` moved to devDeps so the symlinked workspace packages aren't packaged (they're bundled into `out/`).
- **Out**: code signing (no cert yet — installer is unsigned for now), a branded `.ico`, the CI release pipeline + the keepvidya.com download page (M12), macOS/Linux targets.

## 6. Success metrics / done-signal
`Saathi-Setup-<v>.exe` builds; the packaged app launches and runs Python; ready to hand to the owner to install + test.

## 7. Open questions / decisions for owner
- **Unsigned** installer for now (Windows SmartScreen will warn) — a code-signing cert can be added later. A branded icon is a quick follow-up. CI auto-publish + the download page are M12.
