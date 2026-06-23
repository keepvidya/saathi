# Security Policy

Saathi is **local-first**: by default nothing leaves your machine. We take security seriously.

## Reporting a vulnerability
Please **do not** open a public issue for security problems. Email **security@keepvidya.com** with details and reproduction steps. We aim to acknowledge within 72 hours.

## Built-in safeguards
- Electron baseline: `contextIsolation` + `sandbox` on, `nodeIntegration` off; a typed `window.saathi` bridge exposing **one method per IPC channel** (no raw `ipcRenderer`), validated in preload and main.
- Strict Content-Security-Policy in production; external links open in the OS browser.
- No telemetry, no account. Cloud model calls happen only if you explicitly enable them (BYOK).

See [docs/ENGINEERING-PROTOCOL.md §9](docs/ENGINEERING-PROTOCOL.md) for the full security baseline.
