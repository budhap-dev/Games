import { describe, it, expect } from 'vitest'
import { feedback, makeCode } from './logic'

describe('code breaker', () => {
  it('computes black/white pegs with duplicates', () => {
    expect(feedback([0, 1, 2, 3], [0, 1, 2, 3])).toEqual({ black: 4, white: 0 })
    expect(feedback([3, 2, 1, 0], [0, 1, 2, 3])).toEqual({ black: 0, white: 4 })
    expect(feedback([0, 0, 1, 1], [0, 1, 2, 2])).toEqual({ black: 1, white: 1 })
    expect(feedback([5, 5, 5, 5], [5, 0, 0, 0])).toEqual({ black: 1, white: 0 })
  })
  it('makes codes without repeats when asked', () => {
    for (let i = 0; i < 50; i++) { const c = makeCode(6, 4, false); expect(new Set(c).size).toBe(4) }
  })
})
