import type { Pane, PaneId } from '../shell/router'
import { renderOffice } from './office/office'
import { renderChat } from './chat/chat-pane'

/** Nav metadata (order = rail order). Settings is pinned separately in the shell footer. */
export interface NavItem {
  id: PaneId
  label: string
  /** single SVG path `d` for a 24x24 line icon */
  icon: string
}

export const NAV: NavItem[] = [
  { id: 'chat', label: 'Chat', icon: 'M21 11.5a8.4 8.4 0 0 1-12 7.6L3 21l1.9-5.6A8.4 8.4 0 1 1 21 11.5z' },
  { id: 'knowledge', label: 'Knowledge', icon: 'M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2zM18 3v18' },
  { id: 'learn', label: 'Learn', icon: 'M12 4 2 9l10 5 10-5zM6 11v5l6 3 6-3v-5' },
  { id: 'create', label: 'Create', icon: 'M12 3v18M3 12h18' },
  { id: 'office', label: 'Office', icon: 'M3 3h18v18H3zM3 9h18M9 3v18' },
  { id: 'browser', label: 'Browser', icon: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM3 12h18M12 3a14 14 0 0 1 0 18' },
  { id: 'agent', label: 'Agent', icon: 'M12 8V4H8M4 8h16v12H4zM2 14h2M20 14h2M9 13v2M15 13v2' },
  { id: 'skills', label: 'Skills', icon: 'M12 2 4 6v6c0 5 3.4 8.5 8 10 4.6-1.5 8-5 8-10V6z' },
]

export const SETTINGS_NAV: NavItem = {
  id: 'settings',
  label: 'Settings',
  icon: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1L14.5 2h-5l-.3 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4L3.1 11a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.3 2.6h5l.3-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.06-.32.1-.66.1-1z',
}

/** M0 stub pane — a branded placeholder. Real content arrives in each feature's milestone. */
function stub(id: PaneId, label: string, blurb: string): Pane {
  return {
    id,
    label,
    render(el: HTMLElement) {
      const wrap = document.createElement('div')
      wrap.className = 'pane'
      wrap.dataset.pane = id
      const h = document.createElement('h1')
      h.className = 'pane-title'
      h.textContent = label
      const p = document.createElement('p')
      p.className = 'pane-blurb'
      p.textContent = blurb
      const tag = document.createElement('span')
      tag.className = 'pane-tag'
      tag.textContent = 'Walking skeleton · coming in its milestone'
      wrap.append(h, p, tag)
      el.append(wrap)
    },
  }
}

const BLURB: Record<PaneId, string> = {
  chat: 'Local AI chat on Ollama, with optional BYOK cloud. Markdown, history, slash commands.',
  knowledge: 'Your documents, searchable and answerable with citations (DocNest + Knovex RAG).',
  learn: 'Domain-native lessons — code snippets, formulas, diagrams, read-aloud.',
  create: 'Turn dry input into a storybook, game, quiz, or comic you own.',
  office: 'Slides, Sheets, Docs & PDF — built on your machine. No Microsoft Office, no logins.',
  browser: 'A private, multi-tab browser with Shields — ads & trackers blocked, video plays clean.',
  agent: 'Your AI employee — a supervisor reasons, plans, and assigns to specialist workers.',
  skills: 'Reusable skills the app learns and improves over time.',
  settings: 'Local by default. Providers, web search, memory, themes, updates.',
}

/** Real panes (Chat, Office); the rest are stubs until their milestone. */
const REAL: Partial<Record<PaneId, Pane>> = {
  chat: { id: 'chat', label: 'Chat', render: renderChat },
  office: { id: 'office', label: 'Office', render: renderOffice },
}

export const PANES: Pane[] = [...NAV, SETTINGS_NAV].map(
  (n) => REAL[n.id] ?? stub(n.id, n.label, BLURB[n.id]),
)
