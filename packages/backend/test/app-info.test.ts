import { describe, expect, it } from 'vitest'
import { buildAppInfo } from '../src/application/app-info.service'

describe('buildAppInfo (backend, pure)', () => {
  it('builds AppInfo from injected runtime facts', () => {
    expect(buildAppInfo({ version: '1.2.3', platform: 'win32' })).toEqual({
      name: 'Saathi',
      version: '1.2.3',
      platform: 'win32',
    })
  })
})
