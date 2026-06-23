/** The one LLM seam. The LLM only NARRATES prose; structure/numbers are our code's job. */
export interface NarratePrompt {
  task: string
  /** how many lines (bullets/sentences) to produce */
  n?: number
}

export interface LlmPort {
  narrate(prompt: NarratePrompt): Promise<string[]>
}

/**
 * Deterministic, offline narrator — no real LLM. Produces stable, brief-derived lines so the
 * build always works and is fully testable. (Ollama, behind the same port, gives nicer prose.)
 */
export class TemplateLlm implements LlmPort {
  async narrate(prompt: NarratePrompt): Promise<string[]> {
    const n = Math.max(1, prompt.n ?? 3)
    const topic = prompt.task.replace(/\s+/g, ' ').trim() || 'the topic'
    const frames = [
      `Overview of ${topic}`,
      `Why ${topic} matters`,
      `Key results for ${topic}`,
      `Next steps on ${topic}`,
      `Risks and mitigations for ${topic}`,
    ]
    return Array.from({ length: n }, (_, i) => frames[i % frames.length])
  }
}
