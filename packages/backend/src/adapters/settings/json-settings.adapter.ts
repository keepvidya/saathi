// Non-secret app settings, persisted to a JSON file. Plain Node (no electron) →
// unit-testable. (Secrets live in the main-process SecretStore — ADR-0008.)
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import type { AppSettings } from '@saathi/shared'
import { defaultSettings, type SettingsPort } from '../../ports/settings.port'

export class JsonSettings implements SettingsPort {
  private data: AppSettings

  constructor(private readonly file: string) {
    this.data = this.load()
  }

  private load(): AppSettings {
    try {
      if (!existsSync(this.file)) return defaultSettings()
      const parsed = JSON.parse(readFileSync(this.file, 'utf8'))
      // merge over defaults so new fields get sane values
      return { ...defaultSettings(), ...(parsed as Partial<AppSettings>) }
    } catch {
      return defaultSettings()
    }
  }

  private save(): void {
    try {
      writeFileSync(this.file, JSON.stringify(this.data, null, 2))
    } catch {
      /* settings still apply in-session if the write fails */
    }
  }

  get(): AppSettings {
    return { ...this.data }
  }

  set(patch: Partial<AppSettings>): AppSettings {
    this.data = { ...this.data, ...patch }
    this.save()
    return this.get()
  }
}
