import { describe, it, expect } from 'vitest'
import { makePuzzle, solvable } from './logic'

describe('make 24', () => {
  it('recognises solvable and unsolvable sets', () => {
    expect(solvable([1, 2, 3, 4])).toBe(true)   // (1+2+3)*4
    expect(solvable([8, 3, 8, 3])).toBe(true)   // 8/(3-8/3)
    expect(solvable([1, 1, 1, 1])).toBe(false)
  })
  it('generates solvable puzzles', () => { for (let i = 0; i < 10; i++) expect(solvable(makePuzzle(9))).toBe(true) })
})
