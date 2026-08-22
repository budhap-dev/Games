import { describe, it, expect } from 'vitest'
import { drop, empty, robotMove, winner, landingRow } from './logic'

describe('connect four', () => {
  it('drops to the lowest empty row', () => {
    let b = empty()
    b = drop(b, 3, 'R')!; b = drop(b, 3, 'Y')!
    expect(landingRow(b, 3)).toBe(3)
    expect(b[5 * 7 + 3]).toBe('R'); expect(b[4 * 7 + 3]).toBe('Y')
  })
  it('detects horizontal, vertical and diagonal wins', () => {
    let b = empty(); for (const c of [0, 1, 2, 3]) b = drop(b, c, 'R')!
    expect(winner(b)?.disc).toBe('R')
    b = empty(); for (let i = 0; i < 4; i++) b = drop(b, 2, 'Y')!
    expect(winner(b)?.disc).toBe('Y')
    b = empty()
    for (let c = 0; c < 4; c++) { for (let k = 0; k < c; k++) b = drop(b, c, 'Y')!; b = drop(b, c, 'R')! }
    expect(winner(b)?.disc).toBe('R')
  })
  it('robot blocks an immediate threat and takes a win', () => {
    let b = empty(); for (const c of [0, 1, 2]) b = drop(b, c, 'R')!
    expect(robotMove(b, 'Y', 'normal')).toBe(3)
    expect(robotMove(b, 'Y', 'hard')).toBe(3)
    let w = empty(); for (const c of [4, 5, 6]) w = drop(w, c, 'Y')!
    expect(robotMove(w, 'Y', 'hard')).toBe(3)
  })
})
