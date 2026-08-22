import { describe, it, expect } from 'vitest'
import { isSolved, move, shuffle, solved } from './logic'

describe('sliding puzzle', () => {
  it('starts solved and detects it', () => { expect(isSolved(solved(3))).toBe(true) })
  it('only moves tiles adjacent to the blank', () => {
    const t = solved(3) // blank at 8
    expect(move(t, 0, 3)).toBeNull()
    const m = move(t, 7, 3)!
    expect(m[8]).toBe(8); expect(m[7]).toBe(0)
  })
  it('shuffles into an unsolved but valid permutation', () => {
    const t = shuffle(4, 80)
    expect(isSolved(t)).toBe(false)
    expect([...t].sort((a, b) => a - b)).toEqual(Array.from({ length: 16 }, (_, i) => i))
  })
})
