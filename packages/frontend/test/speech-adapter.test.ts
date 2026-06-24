import { afterEach, describe, expect, it, vi } from 'vitest'
import { WebSpeech, SilentSpeech, makeSpeech } from '../src/adapters/speech/speech.adapter'

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('TC-10.2.3 — Web Speech adapter', () => {
  it('WebSpeech cancels then speaks (mocked speechSynthesis)', () => {
    const cancel = vi.fn()
    const speak = vi.fn()
    vi.stubGlobal('speechSynthesis', { cancel, speak })
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      text: string
      constructor(t: string) {
        this.text = t
      }
    })

    new WebSpeech().speak('hello world')
    expect(cancel).toHaveBeenCalledOnce()
    expect(speak).toHaveBeenCalledOnce()
    expect(speak.mock.calls[0][0].text).toBe('hello world')

    new WebSpeech().stop()
    expect(cancel).toHaveBeenCalledTimes(2)
  })

  it('makeSpeech returns SilentSpeech when speech is unavailable (jsdom)', () => {
    const port = makeSpeech()
    expect(port).toBeInstanceOf(SilentSpeech)
    // no-ops, no throw
    expect(() => {
      port.speak('x')
      port.stop()
    }).not.toThrow()
  })

  it('makeSpeech returns WebSpeech when SpeechSynthesis is present', () => {
    vi.stubGlobal('speechSynthesis', { cancel: vi.fn(), speak: vi.fn() })
    vi.stubGlobal('SpeechSynthesisUtterance', class {
      constructor(public text: string) {}
    })
    expect(makeSpeech()).toBeInstanceOf(WebSpeech)
  })
})
