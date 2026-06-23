import { describe, expect, it } from 'vitest'
import { Conversation, EchoChat } from '../src/chat/chat'

describe('TC-08.1.2 — Conversation keeps order', () => {
  it('records roles + content in order', () => {
    const c = new Conversation()
    c.addUser('a')
    c.addAssistant('b')
    c.addUser('c')
    expect(c.list()).toEqual([
      { role: 'user', content: 'a' },
      { role: 'assistant', content: 'b' },
      { role: 'user', content: 'c' },
    ])
  })
})

describe('TC-08.1.3 — EchoChat is deterministic & references the user', () => {
  it('same input → same reply, mentioning the last user message', async () => {
    const echo = new EchoChat()
    const msgs = [{ role: 'user' as const, content: 'Hello world' }]
    const a = await echo.reply(msgs)
    const b = await echo.reply(msgs)
    expect(a).toBe(b)
    expect(a).toContain('Hello world')
  })
})
