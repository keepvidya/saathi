import {
  runBuild,
  type BuildType,
  type BuildResult,
  type BuildStep,
  type LlmPort,
  type DeckData,
  type SheetData,
  type DocData,
} from '@saathi/domain'

export type BuiltModel = DeckData | SheetData | DocData | undefined

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

const delay = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms))

function stepHtml(s: BuildStep): string {
  return `<div class="bl-step ph-${s.phase}"><span class="bl-agent">${esc(s.agent)}</span><span class="bl-phase">${s.phase}</span><span class="bl-text">${esc(s.text)}</span></div>`
}

/**
 * Run the per-type expert build into `body`: render the live ReAct step log, then load the
 * built draft into the editor via `loadEditor`. Returns the result (for tests).
 */
export async function aiBuild(
  type: BuildType,
  brief: string,
  body: HTMLElement,
  llm: LlmPort,
  loadEditor: (model: BuiltModel) => void,
  stepDelayMs = 600,
): Promise<BuildResult> {
  body.innerHTML = `<div class="build-log"><div class="bl-head">✨ Specialist agents are building your ${type}… <span class="sheets-tag">local</span></div><div class="bl-steps" id="bl-steps"></div></div>`
  const stepsEl = body.querySelector<HTMLElement>('#bl-steps')!

  const result = await runBuild({ type, brief }, llm, (s) => {
    stepsEl.insertAdjacentHTML('beforeend', stepHtml(s))
    stepsEl.scrollTop = stepsEl.scrollHeight
  })

  await delay(stepDelayMs) // let the user see the agents finish
  loadEditor(result.deck ?? result.sheet ?? result.doc)
  return result
}
