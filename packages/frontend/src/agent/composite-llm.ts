import { TemplateLlm, type LlmPort, type NarratePrompt } from '@saathi/domain'
import { bridge } from '../bridge/saathi.bridge'

/**
 * Build-time narrator: try local Ollama (via the host bridge); if it's unavailable or returns
 * nothing, fall back to the deterministic TemplateLlm. So the build is always correct and works
 * offline — better prose when Ollama is running.
 */
export class CompositeLlm implements LlmPort {
  private readonly fallback = new TemplateLlm()

  async narrate(p: NarratePrompt): Promise<string[]> {
    try {
      const lines = await bridge.narrate(p)
      if (lines.length) return lines
    } catch {
      /* fall through */
    }
    return this.fallback.narrate(p)
  }
}

export const makeBuildLlm = (): LlmPort => new CompositeLlm()
