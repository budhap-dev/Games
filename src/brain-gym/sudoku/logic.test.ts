import { describe, it, expect } from 'vitest'
import { SHAPES, conflicts, generate, isSolved } from './logic'

describe('sudoku jr', () => {
  it('generates a valid solved 4x4 and 6x6', () => {
    for (const shape of [SHAPES[4], SHAPES[6]]) {
      const { solution, puzzle } = generate(shape, 6)
      expect(isSolved(solution, shape)).toBe(true)
      expect(puzzle.filter((v) => v === 0).length).toBe(6)
    }
  })
  it('flags conflicting cells', () => {
    const s = SHAPES[4]
    const { solution } = generate(s, 0)
    const g = solution.slice()
    g[1] = g[0] // duplicate in row 0
    const bad = conflicts(g, s)
    expect(bad.has(0)).toBe(true)
    expect(bad.has(1)).toBe(true)
    expect(isSolved(g, s)).toBe(false)
  })
})
