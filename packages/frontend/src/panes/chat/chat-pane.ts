import { Conversation, markdownToHtml } from '@saathi/domain'
import { makeChat } from '../../chat/composite-chat'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

/** The Chat pane: a local AI conversation (Ollama with deterministic fallback), markdown replies. */
export function renderChat(host: HTMLElement): void {
  const conv = new Conversation()
  const chat = makeChat()
  conv.addAssistant(
    'Hi — I’m **Saathi**, your local AI. Ask me anything; everything runs on your machine.',
  )

  host.innerHTML = `<div class="chat" data-pane="chat">
    <div class="chat-msgs" id="chat-msgs"></div>
    <div class="chat-composer">
      <div class="cbox">
        <textarea id="chat-in" rows="1" placeholder="Message Saathi — runs on your machine"></textarea>
        <button class="send" id="chat-send" aria-label="Send">↑</button>
      </div>
    </div>
  </div>`

  const msgsEl = host.querySelector<HTMLElement>('#chat-msgs')!
  const input = host.querySelector<HTMLTextAreaElement>('#chat-in')!
  let busy = false

  const bubble = (role: 'user' | 'assistant', content: string): string => {
    const inner = role === 'user' ? esc(content).replace(/\n/g, '<br>') : markdownToHtml(content)
    return `<div class="msg ${role === 'user' ? 'user' : 'bot'}">${inner}</div>`
  }
  const draw = (extra = ''): void => {
    msgsEl.innerHTML = conv.list().map((m) => bubble(m.role, m.content)).join('') + extra
    msgsEl.scrollTop = msgsEl.scrollHeight
  }

  async function send(): Promise<void> {
    const text = input.value.trim()
    if (!text || busy) return
    busy = true
    conv.addUser(text)
    input.value = ''
    draw('<div class="msg bot typing">…</div>')
    const reply = await chat.reply(conv.list())
    conv.addAssistant(reply)
    draw()
    busy = false
  }

  host.querySelector<HTMLElement>('#chat-send')!.addEventListener('click', () => void send())
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void send()
    }
  })

  draw()
}
