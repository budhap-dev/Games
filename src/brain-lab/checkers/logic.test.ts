import { describe, it, expect } from 'vitest'
import { applyMove, initial, legalMoves, winner } from './logic'
import type { Board } from './logic'

const empty = (): Board => Array(64).fill(null)
describe('checkers', () => {
  it('red has 7 opening moves and 12 pieces each', () => {
    const b = initial()
    expect(b.filter((p) => p === 'r').length).toBe(12)
    expect(legalMoves(b, 'r').length).toBe(7)
  })
  it('captures are compulsory and chain', () => {
    const b = empty()
    b[7 * 8 + 0] = 'r' // a1-ish bottom-left
    b[6 * 8 + 1] = 'b'; b[4 * 8 + 3] = 'b' // two blacks on a diagonal with gaps
    const moves = legalMoves(b, 'r')
    expect(moves.length).toBe(1)
    expect(moves[0].captures.length).toBe(2)
    expect(moves[0].path[moves[0].path.length - 1]).toBe(3 * 8 + 4)
  })
  it('promotes to king on the last row and detects a win', () => {
    const b = empty(); b[1 * 8 + 2] = 'r'; b[7 * 8 + 7] = 'b'
    const m = legalMoves(b, 'r').find((x) => x.path[1] === 0 * 8 + 1)!
    const nb = applyMove(b, m)
    expect(nb[1]).toBe('R')
    const solo = empty(); solo[3 * 8 + 2] = 'r'
    expect(winner(solo, 'b')).toBe('r')
  })
})
