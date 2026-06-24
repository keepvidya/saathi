// Hardware detection + Ollama/Shiva setup (main process only). The installer does
// NOT bundle Ollama/Shiva: on first run we check the machine, and for offline modes
// pull the matching Shiva model — silently installing Ollama first if it's missing.
import os from 'node:os'
import { spawn } from 'node:child_process'
import { createWriteStream } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { Writable } from 'node:stream'
import type { HardwareInfo, OllamaStatus, SetupProgress } from '@saathi/shared'

const OLLAMA_URL = 'http://localhost:11434'
const OLLAMA_INSTALLER = 'https://ollama.com/download/OllamaSetup.exe'

/** Detected specs + the run mode that fits this machine. */
export function hardwareInfo(): HardwareInfo {
  const totalMemGB = Math.round((os.totalmem() / 2 ** 30) * 10) / 10
  const cores = os.cpus().length
  // ≥8 GB → Lite (7B); otherwise Ultra-Lite (1.5B).
  const recommend = totalMemGB >= 8 ? 'lite' : 'ultra'
  return { totalMemGB, cores, recommend }
}

/** Is Ollama running (API up) or at least installed (binary present)? */
export async function ollamaStatus(): Promise<OllamaStatus> {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`, { signal: AbortSignal.timeout(1500) })
    if (res.ok) {
      const data = (await res.json()) as { models?: { name: string }[] }
      return { installed: true, running: true, models: (data.models ?? []).map((m) => m.name) }
    }
  } catch {
    /* not running — fall through to a binary check */
  }
  return { installed: await hasOllamaBinary(), running: false, models: [] }
}

function hasOllamaBinary(): Promise<boolean> {
  return new Promise((resolve) => {
    const cmd = process.platform === 'win32' ? 'where' : 'which'
    const proc = spawn(cmd, ['ollama'])
    proc.on('error', () => resolve(false))
    proc.on('close', (code) => resolve(code === 0))
  })
}

/** Orchestrates: install Ollama (if missing) → pull the Shiva model, reporting progress. */
export class OllamaSetup {
  constructor(private readonly onProgress: (p: SetupProgress) => void) {}

  async run(model: string): Promise<void> {
    try {
      const status = await ollamaStatus()
      if (!status.installed) {
        if (process.platform !== 'win32') {
          this.onProgress({
            phase: 'error',
            message: 'Please install Ollama from ollama.com, then reopen Saathi.',
          })
          return
        }
        await this.installOllama()
      }
      this.onProgress({ phase: 'pull-model', message: `Getting ${model}…` })
      await this.pullModel(model)
      this.onProgress({ phase: 'done', message: 'All set — Shiva is ready on your machine.' })
    } catch (e) {
      this.onProgress({
        phase: 'error',
        message: e instanceof Error ? e.message : 'Setup could not finish.',
      })
    }
  }

  private async installOllama(): Promise<void> {
    this.onProgress({ phase: 'install-ollama', message: 'Downloading Ollama…', percent: 0 })
    const file = join(tmpdir(), 'OllamaSetup.exe')
    await download(OLLAMA_INSTALLER, file, (percent) =>
      this.onProgress({ phase: 'install-ollama', message: 'Downloading Ollama…', percent }),
    )
    this.onProgress({ phase: 'install-ollama', message: 'Installing Ollama…' })
    await runSilent(file)
  }

  private pullModel(model: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn('ollama', ['pull', model])
      proc.stderr?.on('data', (chunk: Buffer) => {
        const line = chunk.toString().trim()
        const m = /(\d+)%/.exec(line)
        this.onProgress({
          phase: 'pull-model',
          message: line.slice(-80),
          percent: m ? Number(m[1]) : undefined,
        })
      })
      proc.on('error', reject)
      proc.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`Could not pull ${model}.`))))
    })
  }
}

/** Stream a URL to a file, reporting download percent. */
async function download(url: string, dest: string, onPercent: (pct: number) => void): Promise<void> {
  const res = await fetch(url)
  if (!res.ok || !res.body) throw new Error('Download failed.')
  const total = Number(res.headers.get('content-length') ?? 0)
  let received = 0
  const out = createWriteStream(dest)
  const sink = new Writable({
    write(chunk, _enc, cb) {
      received += chunk.length
      if (total) onPercent(Math.min(100, Math.round((received / total) * 100)))
      out.write(chunk, () => cb())
    },
  })
  await res.body.pipeTo(Writable.toWeb(sink))
  await new Promise<void>((resolve) => out.end(resolve))
}

/** Run the Ollama installer silently and wait for it to finish. */
function runSilent(installer: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn(installer, ['/VERYSILENT', '/NORESTART'], { windowsHide: true })
    proc.on('error', reject)
    proc.on('close', () => resolve())
  })
}
