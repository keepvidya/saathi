import { afterEach, describe, expect, it, vi } from 'vitest'
import { OllamaChat } from '../src/adapters/ollama/ollama-chat.adapter'

afterEach(() => vi.unstubAllGlobals())

describe('TC-08.1.4 — OllamaChat behind ChatPort', () => {
  it('returns the assistant content', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ message: { content: 'hi there' } }) }),
    )
    expect(await new OllamaChat().reply([{ role: 'user', content: 'hi' }])).toBe('hi there')
  })
  it('returns "" on non-ok', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await new OllamaChat().reply([{ role: 'user', content: 'x' }])).toBe('')
  })
  it('returns "" when fetch throws', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('down')))
    expect(await new OllamaChat().reply([{ role: 'user', content: 'x' }])).toBe('')
  })
})
