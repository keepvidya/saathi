import { sampleDeck, type DeckData } from '@saathi/domain'
import { bridge } from '../../bridge/saathi.bridge'

const esc = (s: string): string =>
  s.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c] as string)

/** The Slides editor: an editable slide canvas + a slide strip, with .pptx download. */
export function renderSlides(host: HTMLElement, initial?: DeckData): void {
  const deck: DeckData = initial ?? sampleDeck()
  let active = 0

  host.innerHTML = `
    <div class="slides">
      <div class="slides-top">
        <b class="slides-title">${esc(deck.title)}.pptx</b>
        <span class="sheets-tag">Slides · local</span>
        <span style="flex:1"></span>
        <button class="kp-btn" id="pptx-dl">⤓ Download .pptx</button>
      </div>
      <div class="slides-main">
        <div class="slide-stage"><div class="slide-canvas" id="slide-canvas"></div></div>
        <div class="slide-strip" id="slide-strip"></div>
      </div>
    </div>`

  const canvas = host.querySelector<HTMLElement>('#slide-canvas')!
  const strip = host.querySelector<HTMLElement>('#slide-strip')!

  function saveActive(): void {
    const t = canvas.querySelector<HTMLElement>('.slide-title')
    if (t) deck.slides[active].title = t.textContent ?? ''
    deck.slides[active].bullets = [...canvas.querySelectorAll<HTMLElement>('.slide-bullets li')].map(
      (li) => li.textContent ?? '',
    )
  }

  function drawCanvas(): void {
    const s = deck.slides[active]
    canvas.innerHTML = `
      <div class="slide-title" contenteditable="true" spellcheck="false">${esc(s.title)}</div>
      <div class="slide-rule"></div>
      <ul class="slide-bullets" contenteditable="true" spellcheck="false">${s.bullets
        .map((b) => `<li>${esc(b)}</li>`)
        .join('')}</ul>`
  }

  function drawStrip(): void {
    strip.innerHTML =
      deck.slides
        .map(
          (s, i) =>
            `<button class="slide-thumb${i === active ? ' on' : ''}" data-i="${i}"><span class="stn">${i + 1}</span><span class="stt">${esc(s.title)}</span></button>`,
        )
        .join('') + `<button class="slide-thumb add" data-add title="Add slide">＋</button>`
  }

  drawCanvas()
  drawStrip()

  strip.addEventListener('click', (e) => {
    const target = e.target as HTMLElement
    if (target.closest('[data-add]')) {
      saveActive()
      deck.slides.push({ title: 'New slide', bullets: ['New point'] })
      active = deck.slides.length - 1
      drawCanvas()
      drawStrip()
      return
    }
    const b = target.closest<HTMLElement>('[data-i]')
    if (b) {
      saveActive()
      active = Number(b.dataset.i)
      drawCanvas()
      drawStrip()
    }
  })

  canvas.addEventListener('focusout', saveActive)

  host.querySelector<HTMLElement>('#pptx-dl')!.addEventListener('click', async () => {
    saveActive()
    await bridge.exportPptx(deck)
  })
}
