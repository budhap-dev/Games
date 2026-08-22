import { describe, it, expect } from 'vitest'
import { canMove, move, optimal, solved, start } from './logic'

describe('tower of hanoi', () => {
  it('enforces the size rule', () => {
    const p = start(3)
    expect(canMove(p, 0, 1)).toBe(true)
    const q = move(p, 0, 1) // disc 1 on peg B
    expect(canMove(q, 0, 1)).toBe(false) // disc 2 can't go on disc 1
    expect(canMove(q, 0, 2)).toBe(true)
  })
  it('solves 3 discs in 7 moves', () => {
    let p = start(3)
    const seq: [number, number][] = [[0, 2], [0, 1], [2, 1], [0, 2], [1, 0], [1, 2], [0, 2]]
    for (const [f, t] of seq) { expect(canMove(p, f, t)).toBe(true); p = move(p, f, t) }
    expect(solved(p, 3)).toBe(true); expect(optimal(3)).toBe(7)
  })
})
