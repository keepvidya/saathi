import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderMemory } from '../src/panes/memory/memory-pane'
import type { MemoryControl } from '../src/bridge/saathi.bridge'
import type { MemoryItem } from '@saathi/shared'

const item = (text: string, id = text): MemoryItem => ({ id, text, createdAt: Date.now() })
const flush = (): Promise<void> => new Promise((r) => setTimeout(r, 0))

function makeStub(initial: MemoryItem[] = []) {
  const store = [...initial]
  const control: MemoryControl = {
    remember: vi.fn(async (t: string) => {
      const it = item(t)
      store.unshift(it)
      return it
    }),
    recall: vi.fn(async (q: string) => store.filter((i) => i.text.toLowerCase().includes(q.toLowerCase()))),
    list: vi.fn(async () => store),
    forget: vi.fn(async (id: string) => {
      const i = store.findIndex((x) => x.id === id)
      if (i >= 0) store.splice(i, 1)
    }),
  }
  return control
}

describe('TC-18.2.1 — Memory pane', () => {
  let host: HTMLElement
  beforeEach(() => {
    document.body.innerHTML = ''
    host = document.createElement('div')
    document.body.append(host)
  })

  it('lists existing memories on mount', async () => {
    renderMemory(host, { memory: makeStub([item('hello world')]) })
    await flush()
    expect(host.querySelector('.mem-item-text')?.textContent).toBe('hello world')
  })

  it('saving a note calls remember and shows it', async () => {
    const memory = makeStub()
    renderMemory(host, { memory })
    await flush()
    host.querySelector<HTMLTextAreaElement>('#mem-text')!.value = 'buy oat milk'
    host.querySelector<HTMLElement>('#mem-save')!.click()
    await flush()
    expect(memory.remember).toHaveBeenCalledWith('buy oat milk')
    expect(host.querySelector('.mem-item-text')?.textContent).toBe('buy oat milk')
  })

  it('searching calls recall and renders matches', async () => {
    const memory = makeStub([item('taxes are due'), item('water the plants')])
    renderMemory(host, { memory })
    await flush()
    const q = host.querySelector<HTMLInputElement>('#mem-q')!
    q.value = 'plants'
    q.dispatchEvent(new Event('input', { bubbles: true }))
    await flush()
    expect(memory.recall).toHaveBeenCalledWith('plants', 20)
    const texts = [...host.querySelectorAll('.mem-item-text')].map((e) => e.textContent)
    expect(texts).toEqual(['water the plants'])
  })

  it('forgetting a memory calls forget and removes it', async () => {
    const memory = makeStub([item('temporary note', 'n1')])
    renderMemory(host, { memory })
    await flush()
    host.querySelector<HTMLButtonElement>('.mem-forget')!.click()
    await flush()
    expect(memory.forget).toHaveBeenCalledWith('n1')
    expect(host.querySelector('.mem-empty')).toBeTruthy()
  })
})
