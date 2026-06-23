import { describe, expect, it } from 'vitest'
import { Router, type Pane, type PaneId } from '../src/shell/router'

const make = (id: PaneId): Pane => ({
  id,
  label: id,
  render: (el) => {
    const d = document.createElement('div')
    d.dataset.pane = id
    d.textContent = id
    el.append(d)
  },
})

describe('TC-00.1.2 — router resolves and renders', () => {
  it('resolves registered, undefined for unknown, renders + active', () => {
    const r = new Router().register(make('office')).register(make('settings'))
    expect(r.resolve('office')?.id).toBe('office')
    expect(r.resolve('nope' as PaneId)).toBeUndefined()

    const host = document.createElement('div')
    expect(r.show('office', host)).toBe(true)
    expect(host.querySelector('[data-pane="office"]')).toBeTruthy()
    expect(r.active).toBe('office')

    expect(r.show('ghost' as PaneId, host)).toBe(false)
    expect(r.ids()).toEqual(['office', 'settings'])
  })
})
