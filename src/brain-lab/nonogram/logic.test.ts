import { describe, it, expect } from 'vitest'
import { clues, colClues, generate, rowClues, solves } from './logic'

describe('nonogram', () => {
  it('computes clues with gaps', () => {
    expect(clues([true, true, false, true, false, false, true, true, true])).toEqual([2, 1, 3])
    expect(clues([false, false])).toEqual([0])
  })
  it('a generated picture solves its own clues', () => {
    const g = generate(8)
    expect(solves(g, rowClues(g), colClues(g))).toBe(true)
    const wrong = g.map((r) => r.map(() => false))
    expect(solves(wrong, rowClues(g), colClues(g))).toBe(false)
  })
})
