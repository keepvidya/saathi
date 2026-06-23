import type { LlmPort, NarratePrompt } from '@saathi/domain'

export interface OllamaConfig {
  url?: string
  model?: string
}

/**
 * Real LLM behind `LlmPort` — local Ollama over HTTP (built-in fetch; IO isolated here).
 * On any failure returns `[]` so the caller falls back to the deterministic narrator.
 */
export class OllamaLlm implements LlmPort {
  constructor(private readonly cfg: OllamaConfig = {}) {}

  async narrate(prompt: NarratePrompt): Promise<string[]> {
    const base = this.cfg.url ?? 'http://localhost:11434'
    const model = this.cfg.model ?? 'llama3.1:8b'
    const n = prompt.n ?? 3
    const body = JSON.stringify({
      model,
      prompt: `Write exactly ${n} short, punchy lines about: ${prompt.task}. One per line. No numbering, no preamble.`,
      stream: false,
    })
    try {
      const res = await fetch(`${base}/api/generate`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      })
      if (!res.ok) return []
      const data = (await res.json()) as { response?: string }
      return (data.response ?? '')
        .split('\n')
        .map((l) => l.replace(/^[\s\-*•\d.)]+/, '').trim())
        .filter((l) => l.length > 0)
        .slice(0, n)
    } catch {
      return []
    }
  }
}
