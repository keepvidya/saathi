import { describe, expect, it } from 'vitest'
import { validateDeck, validateDoc, validateSheet } from '../src/agent/validators'
import { budgetSheet } from '../src/sheet/sheet'

describe('validators (all branches)', () => {
  it('validateDeck: valid vs each failure', () => {
    expect(validateDeck({ title: 't', slides: [{ title: 'A', bullets: ['x'] }] })).toBeNull()
    expect(validateDeck({ title: 't', slides: [] })).toMatch(/no slides/)
    expect(validateDeck({ title: 't', slides: [{ title: ' ', bullets: ['x'] }] })).toMatch(/title/)
    expect(validateDeck({ title: 't', slides: [{ title: 'A', bullets: ['', '  '] }] })).toMatch(/bullets/)
  })

  it('validateDoc: valid vs missing heading / body', () => {
    expect(validateDoc({ blocks: [{ type: 'h1', runs: [{ text: 'H' }] }, { type: 'p', runs: [{ text: 'b' }] }] })).toBeNull()
    expect(validateDoc({ blocks: [{ type: 'p', runs: [{ text: 'b' }] }] })).toMatch(/heading/)
    expect(validateDoc({ blocks: [{ type: 'h1', runs: [{ text: 'H' }] }] })).toMatch(/body/)
  })

  it('validateSheet: total computes vs does not', () => {
    expect(validateSheet(budgetSheet().toData(), 'E2')).toBeNull() // = 447
    expect(validateSheet({ cells: { E2: '=1/0' }, rows: 5, cols: 5 }, 'E2')).toMatch(/did not compute/)
  })
})
