# DEV — 22-packaging (M11c)

## 1. Approach
`electron-vite build` emits `out/` (main/preload/renderer, with `@saathi/*` + the renderer vendors bundled). **electron-builder** then packages `out/` + the externalized main-process vendors into a Windows **NSIS** installer. `electron-updater` checks a GitHub release feed on launch (packaged-only).

## 2. Key configuration (electron-builder.yml)
- `electronVersion: 33.4.11` — electron is hoisted to the workspace root, so pin it.
- `npmRebuild/nodeGypRebuild/buildDependenciesFromSource: false` — in an npm workspace, electron-builder's dep-rebuild step **prunes the hoisted root node_modules** (deleting its own helpers). Nothing here is a native addon, so skip it.
- `@saathi/*` moved to **devDependencies** — they symlink to sibling dirs outside the app (electron-builder can't asar files outside the app dir), and they're already bundled into `out/`. So they must not be production deps.
- `asarUnpack: '**/node_modules/pyodide/**'` — Pyodide reads its WASM + stdlib zip from disk at runtime; it can't live inside the asar.
- `publish: github (keepvidya/saathi)` — the update feed (releases published in M12).
- NSIS: `oneClick:false`, choose-folder, Start-menu shortcut.

## 3. Auto-update
`main`: `if (app.isPackaged) autoUpdater.checkForUpdatesAndNotify().catch(()=>{})` — guarded so a missing feed never crashes; only active in the installed app.

## 4. Build
`npm run package` = `electron-vite build && electron-builder --win nsis --publish never` → `packages/desktop/release/Saathi-Setup-<v>.exe` (+ `win-unpacked/`). The installer is **unsigned** (no cert yet).

## 5. Verification
A one-off packaged smoke test (`executablePath` = the unpacked `Saathi.exe`) confirms: boots → onboarding → shell → **runnable Python** (proving the Pyodide asar-unpack). Not part of the gated suite (needs the built binary).

## 6. Risks & mitigations
- **Workspace prune** → `npmRebuild:false`.
- **Symlinked workspace pkgs** → moved to devDeps + excluded.
- **Pyodide at runtime** → asar-unpacked + verified.
- **Unsigned / SmartScreen** → known; signing cert is a follow-up.

## 7. ADRs
None (configuration). CI publish + download page → M12.
