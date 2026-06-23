export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/** The chat seam. Implemented by EchoChat (offline), OllamaChat (backend), CompositeChat (frontend). */
export interface ChatPort {
  reply(messages: ChatMessage[]): Promise<string>
}

/** In-session conversation history (ordered). Pure. */
export class Conversation {
  private readonly msgs: ChatMessage[] = []
  addUser(content: string): void {
    this.msgs.push({ role: 'user', content })
  }
  addAssistant(content: string): void {
    this.msgs.push({ role: 'assistant', content })
  }
  list(): ChatMessage[] {
    return [...this.msgs]
  }
}

/** Deterministic offline reply — used when no model (Ollama) is available. */
export class EchoChat implements ChatPort {
  async reply(messages: ChatMessage[]): Promise<string> {
    const last = [...messages].reverse().find((m) => m.role === 'user')?.content ?? ''
    return (
      `You said: **${last}**\n\n` +
      'I’m running locally without a model right now, so this is a deterministic reply. ' +
      'Start **Ollama** for full answers — nothing leaves your machine either way.'
    )
  }
}
