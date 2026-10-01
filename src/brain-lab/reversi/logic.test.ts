import { describe, it, expect } from 'vitest'
import { N, applyMove, count, initial, isOver, legalMoves, robotMove, square } from './logic'
import type { Board } from './logic'

const at = (r: number, c: number) => r * N + c
describe('reversi', () => {
  it('black has four opening moves, each flipping one disc', () => {
    const moves = legalMoves(initial(), 'b')
    expect(moves.map((m) => m.i).sort((a, b) => a - b)).toEqual([at(2, 3), at(3, 2), at(4, 5), at(5, 4)])
    expect(moves.every((m) => m.flips.length === 1)).toBe(true)
  })
  it('flips in several directions at once', () => {
    const b: Board = Array(64).fill(null)
    b[at(0, 0)] = 'b'; b[at(1, 1)] = 'w' // diagonal
    b[at(2, 0)] = 'b'; b[at(2, 1)] = 'w' // row
    const m = legalMoves(b, 'b').find((x) => x.i === at(2, 2))!
    expect(m.flips.sort()).toEqual([at(1, 1), at(2, 1)].sort())
    const nb = applyMove(b, m, 'b')
    expect(count(nb, 'b')).toBe(5); expect(count(nb, 'w')).toBe(0)
    expect(isOver(nb)).toBe(true)
  })
  it('every robot level plays a legal move and hard grabs a free corner', () => {
    for (const s of ['easy', 'normal', 'hard'] as const) {
      const m = robotMove(initial(), 'w', s)!
      expect(legalMoves(initial(), 'w').some((x) => x.i === m.i)).toBe(true)
    }
    const b: Board = Array(64).fill(null)
    b[at(1, 1)] = 'b'; b[at(2, 2)] = 'w'; b[at(4, 4)] = 'b'; b[at(3, 3)] = 'w'; b[at(5, 5)] = 'w'
    expect(robotMove(b, 'w', 'hard')!.i).toBe(at(0, 0))
    expect(robotMove(b, 'w', 'normal')!.i).toBe(at(0, 0))
  })
  it('names squares a–h left to right, 8–1 top to bottom', () => {
    expect(square(at(0, 0))).toBe('a8'); expect(square(at(7, 7))).toBe('h1'); expect(square(at(2, 3))).toBe('d6')
  })
})
