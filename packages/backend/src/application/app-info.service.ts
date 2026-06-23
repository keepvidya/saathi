import type { AppInfo } from '@saathi/shared'

/** Runtime facts injected by the host (keeps this module free of Electron/process). */
export interface RuntimeInfo {
  version: string
  platform: string
}

/**
 * Pure application service: builds the app's identity from injected runtime facts.
 * No Electron, no DOM — this is the "backend", reusable headless.
 */
export function buildAppInfo(runtime: RuntimeInfo): AppInfo {
  return { name: 'Saathi', version: runtime.version, platform: runtime.platform }
}
