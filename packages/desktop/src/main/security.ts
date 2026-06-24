/**
 * Electron security baseline (ENGINEERING-PROTOCOL §9). Plain data — no electron import,
 * so it is unit-testable. Spread into BrowserWindow webPreferences.
 */
export const WINDOW_SECURITY = {
  nodeIntegration: false,
  contextIsolation: true,
  sandbox: true,
  webSecurity: true,
} as const

/**
 * Production Content-Security-Policy (applied via response headers when packaged).
 * `font-src 'self'` lets locally-bundled fonts (e.g. KaTeX woff2) load under file://.
 */
export const CSP =
  "default-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
  "font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; script-src 'self'"
