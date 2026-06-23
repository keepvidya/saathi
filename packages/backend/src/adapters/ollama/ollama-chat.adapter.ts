import type { ChatPort, ChatMessage } from '@saathi/domain'

export interface OllamaChatConfig {
  url?: string
  model?: string
}

/** Real chat behind `ChatPort` — local Ollama `/api/chat` (built-in fetch). `''` on failure. */
export class OllamaChat implements ChatPort {
  constructor(private readonly cfg: OllamaChatConfig = {}) {}

  async reply(messages: ChatMessage[]): Promise<string> {
    const base = this.cfg.url ?? 'http://localhost:11434'
    const model = this.cfg.model ?? 'llama3.1:8b'
    try {
      const res = await fetch(`${base}/api/chat`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ model, messages, stream: false }),
      })
      if (!res.ok) return ''
      const data = (await res.json()) as { message?: { content?: string } }
      return data.message?.content ?? ''
    } catch {
      return ''
    }
  }
}
