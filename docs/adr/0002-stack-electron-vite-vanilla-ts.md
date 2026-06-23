# ADR-0002 — Desktop stack: Electron + Vite + vanilla TypeScript

- **Status**: Accepted (owner-selected 2026-06-23)
- **Date**: 2026-06-23
- **Supersedes**: —

## Context
The approved prototype is a single-file vanilla-JS app. We need a real desktop build. Options weighed: Electron+Vite+React, **Electron+Vite+vanilla TS**, Tauri.

## Decision
**Electron + Vite + vanilla TypeScript**, scaffolded with `electron-vite`.
- **Electron**: same family as the owner's shipped Knovex/Flows; mature webview, `electron-updater`, broad engine compatibility (Univer, @ghostery/adblocker-electron, PDF.js).
- **vanilla TS** (no UI framework): closest 1:1 port of the approved prototype's structure; minimal dependencies; the Wrapper Rule + hexagonal core matter more than a view framework. Univer/engines work framework-free.
- **Vite**: fast dev, simple config via `electron-vite`.

## Consequences
- We hand-roll some UI ergonomics React would give for free — acceptable; the shell is already proven in the prototype.
- Strict security baseline (contextIsolation/sandbox/contextBridge) is mandatory (ENGINEERING-PROTOCOL §9).
- If a future surface truly needs a framework, that is a new ADR — not a default.

## Alternatives rejected
- **React**: more deps + churn for a port that's already vanilla; not needed for correctness.
- **Tauri**: smaller binaries but diverges from Knovex/Flows and complicates the webview-engine integrations.
