import { describe, expect, it } from 'vitest'
import { ok, err, isOk, isErr, mapOk } from '../src/result'

describe('Result<T,E>', () => {
  it('ok / isOk / mapOk', () => {
    const r = ok(2)
    expect(isOk(r)).toBe(true)
    expect(isErr(r)).toBe(false)
    expect(mapOk(r, (n) => n * 3)).toEqual(ok(6))
  })
  it('err / isErr / mapOk passthrough', () => {
    const e = err('boom')
    expect(isErr(e)).toBe(true)
    expect(mapOk(e, (n: number) => n * 3)).toEqual(e)
  })
})
