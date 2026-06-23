import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompositeChat } from '../src/chat/composite-chat'

afterEach(() => {
  delete (globalThis as Record<string, unknown>).saathi
})

describe('CompositeChat — Ollama with Echo fallback (AC-4)', () => {
  it('uses the host reply when non-empty', async () => {
    const reply = vi.fn().mockResolvedValue('from ollama')
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, chat: { reply } }
    await expect(new CompositeChat().reply([{ role: 'user', content: 'x' }])).resolves.toBe('from ollama')
  })

  it('falls back to EchoChat when the host is absent', async () => {
    const out = await new CompositeChat().reply([{ role: 'user', content: 'Hi' }])
    expect(out).toContain('You said')
    expect(out).toContain('Hi')
  })

  it('falls back when the host returns empty', async () => {
    const reply = vi.fn().mockResolvedValue('   ')
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, chat: { reply } }
    expect(await new CompositeChat().reply([{ role: 'user', content: 'Hi' }])).toContain('You said')
  })
})
