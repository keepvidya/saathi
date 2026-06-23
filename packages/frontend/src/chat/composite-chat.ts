import { EchoChat, type ChatPort, type ChatMessage } from '@saathi/domain'
import { bridge } from '../bridge/saathi.bridge'

/** Try local Ollama (via the host); fall back to the deterministic EchoChat when unavailable. */
export class CompositeChat implements ChatPort {
  private readonly fallback = new EchoChat()

  async reply(messages: ChatMessage[]): Promise<string> {
    try {
      const text = await bridge.chatReply(messages)
      if (text.trim()) return text
    } catch {
      /* fall through */
    }
    return this.fallback.reply(messages)
  }
}

export const makeChat = (): ChatPort => new CompositeChat()
