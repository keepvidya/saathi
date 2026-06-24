// Encrypted secret storage (ADR-0008). The ONLY file importing electron's safeStorage.
// Renderer can set / has / clear; only the MAIN process can read a plaintext key.
import { safeStorage } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'

export class SecretStore {
  private data: Record<string, string> = {}

  constructor(private readonly file: string) {
    try {
      if (existsSync(this.file)) this.data = JSON.parse(readFileSync(this.file, 'utf8'))
    } catch {
      this.data = {}
    }
  }

  private save(): void {
    try {
      writeFileSync(this.file, JSON.stringify(this.data))
    } catch {
      /* ignore write failures */
    }
  }

  setSecret(name: string, value: string): void {
    if (!value) {
      this.clearSecret(name)
      return
    }
    if (safeStorage.isEncryptionAvailable()) {
      this.data[name] = `enc:${safeStorage.encryptString(value).toString('base64')}`
    } else {
      // OS encryption unavailable (some headless Linux/CI) — store obfuscated, flagged.
      this.data[name] = `raw:${Buffer.from(value, 'utf8').toString('base64')}`
    }
    this.save()
  }

  hasSecret(name: string): boolean {
    return typeof this.data[name] === 'string' && this.data[name].length > 4
  }

  clearSecret(name: string): void {
    if (name in this.data) {
      delete this.data[name]
      this.save()
    }
  }

  /** MAIN-PROCESS ONLY — never exposed over IPC. */
  getSecret(name: string): string | null {
    const v = this.data[name]
    if (!v) return null
    try {
      if (v.startsWith('enc:')) return safeStorage.decryptString(Buffer.from(v.slice(4), 'base64'))
      if (v.startsWith('raw:')) return Buffer.from(v.slice(4), 'base64').toString('utf8')
    } catch {
      return null
    }
    return null
  }
}
