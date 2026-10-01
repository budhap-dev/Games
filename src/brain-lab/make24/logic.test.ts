import { describe, it, expect } from 'vitest'
import { join, makePuzzle, num, solution, solvable } from './logic'

describe('make 24', () => {
  it('recognises solvable and unsolvable sets', () => {
    expect(solvable([1, 2, 3, 4])).toBe(true)   // (1+2+3)*4
    expect(solvable([8, 3, 8, 3])).toBe(true)   // 8/(3-8/3)
    expect(solvable([1, 1, 1, 1])).toBe(false)
  })
  it('generates solvable puzzles', () => { for (let i = 0; i < 10; i++) expect(solvable(makePuzzle(9))).toBe(true) })
  it('writes a solution with only the brackets it needs', () => {
    const evalExpr = (e: string) => Function(`return ${e.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-')}`)() as number
    for (const n of [[1, 2, 3, 4], [8, 3, 8, 3], [6, 6, 6, 6], [1, 5, 5, 5]]) {
      const s = solution(n)!
      expect(evalExpr(s)).toBeCloseTo(24)
      expect(s.match(/\d+/g)!.map(Number).sort()).toEqual([...n].sort())
    }
    expect(solution([1, 1, 1, 1])).toBeNull()
    expect(join(join(num(1), '+', num(2)), '×', num(4)).s).toBe('(1+2)×4')
    expect(join(num(8), '÷', join(num(3), '−', join(num(8), '÷', num(3)))).s).toBe('8÷(3−8÷3)')
    expect(join(num(9), '−', join(num(2), '+', num(1))).s).toBe('9−(2+1)')
  })
})
