import { describe, it, expect } from 'vitest'
import { makePuzzle, puzzlePoints, reflect, solved, trace } from './logic'
import { seeded } from '@/shared/random'

describe('laser mirrors', () => {
  it('reflects like a real mirror', () => {
    expect(reflect('/', 0)).toBe(3) // east → north
    expect(reflect('/', 1)).toBe(2) // south → west
    expect(reflect('\\', 0)).toBe(1) // east → south
    expect(reflect('\\', 3)).toBe(2) // north → west
  })
  it('traces the beam through mirrors and out of the grid', () => {
    // 3×3, laser on row 0: '\' at (0,1) turns it south, '/' at (2,1) turns it west and out
    const { cells, dir } = trace(3, 0, { 1: '\\', 7: '/' })
    expect(cells).toEqual([0, 1, 4, 7, 6]); expect(dir).toBe(2)
  })
  it('every generated puzzle is solvable and does not start solved', () => {
    const rnd = seeded(11)
    for (const d of ['easy', 'normal', 'hard'] as const) for (let k = 0; k < 40; k++) {
      const p = makePuzzle(d, rnd)
      expect(solved(p, p.solution)).toBe(true)
      expect(solved(p, p.start)).toBe(false)
      expect(p.par).toBeGreaterThan(0)
      expect(p.targets.every((t) => !p.solution[t])).toBe(true)
    }
  })
  it('points drop with extra taps, floor of 3', () => {
    expect([puzzlePoints(2, 2), puzzlePoints(5, 2), puzzlePoints(30, 2)]).toEqual([10, 7, 3])
  })
})
