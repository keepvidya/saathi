import { afterEach, describe, expect, it, vi } from 'vitest'
import { CompositeLlm } from '../src/agent/composite-llm'

afterEach(() => {
  delete (globalThis as Record<string, unknown>).saathi
})

describe('CompositeLlm — Ollama with deterministic fallback (AC-5)', () => {
  it('uses the host (Ollama) when it returns lines', async () => {
    const narrate = vi.fn().mockResolvedValue(['from ollama'])
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, llm: { narrate } }
    await expect(new CompositeLlm().narrate({ task: 'x', n: 1 })).resolves.toEqual(['from ollama'])
  })

  it('falls back to the template narrator when the host is absent', async () => {
    const out = await new CompositeLlm().narrate({ task: 'x', n: 3 })
    expect(out.length).toBe(3) // deterministic template lines
  })

  it('falls back when the host throws', async () => {
    const narrate = vi.fn().mockRejectedValue(new Error('down'))
    ;(globalThis as Record<string, unknown>).saathi = { app: { getInfo: vi.fn() }, llm: { narrate } }
    const out = await new CompositeLlm().narrate({ task: 'x', n: 2 })
    expect(out.length).toBe(2)
  })
})
