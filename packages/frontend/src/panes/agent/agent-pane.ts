import { runDefaultAgent, markdownToHtml, type AgentResult, type AgentStep } from '@saathi/domain'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

export interface AgentOptions {
  /** Runs a goal → result. Defaults to the deterministic agent (calc + search). */
  run?: (goal: string) => AgentResult
}

const PHASE_LABEL: Record<AgentStep['phase'], string> = {
  reason: 'Reason',
  act: 'Delegate',
  observe: 'Result',
  answer: 'Answer',
}

/**
 * The Agent pane: a goal in, a ReAct trace out. The supervisor reasons and
 * delegates to worker tools (calc / search) that compute the real answer — the
 * UI only shows the trace and the result.
 */
export function renderAgent(host: HTMLElement, opts: AgentOptions = {}): void {
  const runGoal = opts.run ?? runDefaultAgent

  host.innerHTML = `<div class="agent" data-pane="agent">
    <div class="ag-head">
      <h1 class="ag-title">Agent</h1>
      <p class="ag-sub">Give a goal — the supervisor reasons, delegates to worker tools, and answers. Calculations and answers are <strong>computed by Saathi</strong>, not guessed.</p>
    </div>
    <div class="ag-body" id="ag-body">
      <div class="ag-empty">Try “12.5 * (8 + 4)” or “what is photosynthesis?”.</div>
    </div>
    <div class="ag-composer">
      <div class="cbox">
        <input id="ag-in" placeholder="Give the agent a goal…" spellcheck="false" />
        <button class="send" id="ag-run" aria-label="Run">↑</button>
      </div>
    </div>
  </div>`

  const body = host.querySelector<HTMLElement>('#ag-body')!
  const input = host.querySelector<HTMLInputElement>('#ag-in')!

  const stepHtml = (s: AgentStep): string =>
    `<div class="ag-step ph-${s.phase}">` +
    `<span class="ag-chip">${esc(s.agent)}</span>` +
    `<span class="ag-step-label">${PHASE_LABEL[s.phase]}</span>` +
    `<span class="ag-step-text">${esc(s.text)}</span></div>`

  const draw = (goal: string, result: AgentResult): void => {
    const trace = result.steps.filter((s) => s.phase !== 'answer').map(stepHtml).join('')
    body.innerHTML =
      `<div class="ag-goal">${esc(goal)}</div>` +
      `<div class="ag-trace">${trace}</div>` +
      `<div class="ag-answer">${markdownToHtml(result.answer)}</div>`
    body.scrollTop = body.scrollHeight
  }

  function run(): void {
    const goal = input.value.trim()
    if (!goal) return
    draw(goal, runGoal(goal))
    input.value = ''
  }

  host.querySelector<HTMLElement>('#ag-run')!.addEventListener('click', run)
  input.addEventListener('keydown', (e) => {
    if ((e as KeyboardEvent).key === 'Enter') {
      e.preventDefault()
      run()
    }
  })
}
