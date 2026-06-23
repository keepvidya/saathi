# BA — 00-walking-skeleton

## 1. Problem & context
Before any feature, we need a **real, secure, bootable Saathi shell** that proves the spine: it launches as a desktop app, shows the rail, switches between panes, and applies the theme. This de-risks the architecture (Electron security, renderer mount, router, theming) before we invest in engines. Reference: the approved prototype shell (`keepvidya-workspace/index.html`).

## 2. Users & jobs-to-be-done
- Primary: the dev team (proves the foundation) and, later, every end user (this shell hosts every feature).
- Job: "When I open Saathi, I want a working, branded window I can navigate, so the app feels real and we can build features into it safely."

## 3. User stories
- **US-1**: As a user, I want the app to open in a desktop window showing the Saathi rail, so I know it launched.
- **US-2**: As a user, I want to click a rail item and see that pane, so I can navigate.
- **US-3**: As a user, I want to toggle light/dark, so the app matches my preference, and it persists next launch.
- **US-4**: As a developer, I want the renderer to reach the main process only through a typed, minimal, validated bridge, so the app is secure by construction.

## 4. Acceptance criteria (→ test cases)
- **AC-1** (US-1): GIVEN the app is launched WHEN the window loads THEN the rail is visible with the Saathi brand and the default pane (Chat) is shown. *(→ TC-00.3.1)*
- **AC-2** (US-2): GIVEN the app is open WHEN I activate the "Office" rail item THEN the Office pane content renders and the item is marked active. *(→ TC-00.1.2, TC-00.3.2)*
- **AC-3** (US-3): GIVEN light theme WHEN I toggle theme THEN `data-theme` becomes `dark`, the CSS variables update, AND on relaunch the choice persists. *(→ TC-00.1.1, TC-00.3.3)*
- **AC-4** (US-4): GIVEN the renderer WHEN it requests app info THEN it receives it via `window.saathi.app.getInfo()` only; `nodeIntegration` is off, `contextIsolation`/`sandbox` on, and no raw `ipcRenderer` is exposed. *(→ TC-00.1.3, TC-00.2.1)*

## 5. Scope
- **In**: secure Electron shell; renderer mount; collapsible rail; pane **router** with stub panes; **theme engine** (tokens + light/dark + persistence); one bridge method (`app.getInfo`); tests at all 3 levels; CI workflow file.
- **Out (later milestones)**: full 10-theme port (M1), any real feature/engine (M2+), GitHub repo creation (deferred by owner), packaging (M11).

## 6. Success metrics / done-signal
App boots to a branded, navigable, themeable window; all M0 tests green; visual review passes in light + dark; security baseline verified.

## 7. Open questions
- None blocking. Full theme set intentionally deferred to M1.
