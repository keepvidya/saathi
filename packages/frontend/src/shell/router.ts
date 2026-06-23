/** Pane router — O(1) registry lookup; typed ids prevent typos (DEV.md §4). */
export type PaneId =
  | 'chat'
  | 'knowledge'
  | 'learn'
  | 'create'
  | 'office'
  | 'browser'
  | 'agent'
  | 'skills'
  | 'settings'

export interface Pane {
  id: PaneId
  label: string
  render(el: HTMLElement): void
}

export class Router {
  private readonly panes = new Map<PaneId, Pane>()
  active: PaneId | null = null

  register(pane: Pane): this {
    this.panes.set(pane.id, pane)
    return this
  }

  resolve(id: PaneId): Pane | undefined {
    return this.panes.get(id)
  }

  /** Render a pane into host. Returns false (no throw) for an unknown id. */
  show(id: PaneId, host: HTMLElement): boolean {
    const pane = this.panes.get(id)
    if (!pane) return false
    this.active = id
    host.replaceChildren()
    pane.render(host)
    return true
  }

  ids(): PaneId[] {
    return [...this.panes.keys()]
  }
}
