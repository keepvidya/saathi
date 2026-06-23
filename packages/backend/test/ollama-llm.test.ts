import { afterEach, describe, expect, it, vi } from 'vitest'
import { OllamaLlm } from '../src/adapters/ollama/ollama-llm.adapter'

afterEach(() => vi.unstubAllGlobals())

describe('TC-05.1.5 — OllamaLlm behind LlmPort', () => {
  it('parses response lines (strips bullets/numbering)', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ response: '- alpha\n* beta\n3. gamma' }) }),
    )
    const out = await new OllamaLlm().narrate({ task: 'x', n: 3 })
    expect(out).toEqual(['alpha', 'beta', 'gamma'])
  })

  it('returns [] on a non-ok response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false }))
    expect(await new OllamaLlm().narrate({ task: 'x' })).toEqual([])
  })

  it('returns [] when fetch throws (Ollama down)', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('ECONNREFUSED')))
    expect(await new OllamaLlm().narrate({ task: 'x' })).toEqual([])
  })
})
