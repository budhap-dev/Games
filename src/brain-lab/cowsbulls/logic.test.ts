import { describe, it, expect } from 'vitest'
import { bullsCows, hasRepeats, makeSecret } from './logic'

describe('cows & bulls', () => {
  it('makes distinct-digit secrets of the right length', () => {
    for (let i = 0; i < 30; i++) { const s = makeSecret(4); expect(s).toMatch(/^\d{4}$/); expect(hasRepeats(s)).toBe(false) }
    expect(makeSecret(5).length).toBe(5)
  })
  it('counts bulls and cows', () => {
    expect(bullsCows('1234', '1234')).toEqual({ bulls: 4, cows: 0 })
    expect(bullsCows('4321', '1234')).toEqual({ bulls: 0, cows: 4 })
    expect(bullsCows('1243', '1234')).toEqual({ bulls: 2, cows: 2 })
    expect(bullsCows('5678', '1234')).toEqual({ bulls: 0, cows: 0 })
  })
})
