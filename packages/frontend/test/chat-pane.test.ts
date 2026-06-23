import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { renderChat } from '../src/panes/chat/chat-pane'

describe('TC-08.2.1 — Chat pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
    renderChat(host)
  })
  afterEach(() => {
    delete (globalThis as Record<string, unknown>).saathi
  })

  it('shows a markdown-rendered welcome bot bubble', () => {
    expect(host.querySelector('.msg.bot')?.innerHTML).toContain('<strong>Saathi</strong>')
  })

  it('sending appends a user bubble + a markdown reply (Echo fallback, no host)', async () => {
    host.querySelector<HTMLTextAreaElement>('#chat-in')!.value = 'Hello'
    host.querySelector<HTMLElement>('#chat-send')!.click()
    await new Promise((r) => setTimeout(r, 20))

    const users = [...host.querySelectorAll('.msg.user')]
    expect(users.some((u) => u.textContent === 'Hello')).toBe(true)

    const lastBot = [...host.querySelectorAll('.msg.bot')].pop()!
    expect(lastBot.innerHTML).toContain('<strong>Hello</strong>') // "You said: **Hello**"
    expect(lastBot.innerHTML).not.toContain('**') // markdown was rendered, not shown raw
  })
})
