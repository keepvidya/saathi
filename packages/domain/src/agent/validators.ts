import type { DeckData } from '../deck/deck'
import type { DocData } from '../doc/doc'
import { Sheet, type SheetData } from '../sheet/sheet'

/** Each validator returns the failure reason as a string, or null when valid. */

export function validateDeck(deck: DeckData): string | null {
  if (!deck.slides.length) return 'deck has no slides'
  for (const s of deck.slides) {
    if (!s.title.trim()) return 'a slide is missing its title'
    if (!s.bullets.some((b) => b.trim() !== '')) return 'a slide is missing bullets'
  }
  return null
}

export function validateDoc(doc: DocData): string | null {
  if (!doc.blocks.some((b) => b.type === 'h1')) return 'document has no heading'
  if (!doc.blocks.some((b) => b.type === 'p')) return 'document has no body'
  return null
}

/** Uses the formula engine: the named total cell must evaluate to a real number. */
export function validateSheet(data: SheetData, totalRef = 'E2'): string | null {
  const sheet = Sheet.from(data)
  const v = sheet.evaluate(totalRef)
  if (typeof v !== 'number' || !Number.isFinite(v)) return `total cell ${totalRef} did not compute`
  return null
}
