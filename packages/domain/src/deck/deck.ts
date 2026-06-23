/** A slide deck as a pure, serializable model. No DOM/IO. */
export interface Slide {
  title: string
  bullets: string[]
}
export interface DeckData {
  title: string
  slides: Slide[]
}

/** All text in the deck (titles + bullets), for assertions / search. */
export function deckPlainText(deck: DeckData): string {
  return [deck.title, ...deck.slides.flatMap((s) => [s.title, ...s.bullets])].join('\n')
}

/** The M4 fixture: a 3-slide investor update. */
export function sampleDeck(): DeckData {
  return {
    title: 'Q3 Investor Update',
    slides: [
      {
        title: 'Q3 Investor Update',
        bullets: ['Revenue up 18% on enterprise renewals', 'Gross margin held at 71%', 'Two new strategic partners'],
      },
      {
        title: 'Growth',
        bullets: ['ARR crossed $4.2M', 'Net retention 119%', 'Pipeline up 2.3x QoQ'],
      },
      {
        title: 'The Ask',
        bullets: ['Raising $6M Series A', '18-month runway to profitability', 'Lead with product-led growth'],
      },
    ],
  }
}
