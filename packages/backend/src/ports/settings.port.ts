import type { AppSettings } from '@saathi/shared'
import { defaultSettings } from '@saathi/shared'

export type { AppSettings }
export { defaultSettings }

/** Outbound port: non-secret app settings (keys live in the main-process SecretStore). */
export interface SettingsPort {
  get(): AppSettings
  set(patch: Partial<AppSettings>): AppSettings
}
