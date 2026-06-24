# TEST PLAN — 22-packaging (M11c)

- **Plan id**: TP-22
- **Items under test**: `electron-builder.yml`, the `package` scripts, `electron-updater` wiring.
- **Approach**: build verification + a one-off packaged smoke test + the unchanged dev gates.

## TC-22.1 — installer builds
| # | Action | Expected |
|---|---|---|
| 1 | `npm run package` | `release/Saathi-Setup-<v>.exe` + `release/win-unpacked/` produced; no errors |
| 2 | inspect | `app.asar.unpacked/node_modules/pyodide/pyodide.asm.wasm` + `python_stdlib.zip` present |

## TC-22.2 — packaged app works (manual, built binary)
| # | Action | Expected |
|---|---|---|
| 1 | launch `win-unpacked/Saathi.exe` | onboarding (first run) → Finish → the shell mounts |
| 2 | Learn → Run the Python snippet | output `5` (Pyodide asar-unpack works) |

## TC-22.3 — dev unaffected
| # | Action | Expected |
|---|---|---|
| 1 | `npm run test:e2e` | all 21 e2e green (unpackaged → shell, no updater) |

## Traceability
| AC | Covered by |
|---|---|
| AC-1 | TC-22.1 |
| AC-2 | TC-22.2 |
| AC-3 | wiring + M12 |
