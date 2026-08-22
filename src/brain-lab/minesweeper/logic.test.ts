import { describe, it, expect } from 'vitest'
import { blank, isCleared, open, placeMines, toggleFlag } from './logic'

const S = { rows: 6, cols: 6 }
describe('minesweeper', () => {
  it('never places a mine on or next to the first tap', () => {
    for (let t = 0; t < 20; t++) {
      const b = placeMines(blank(S), S, 10, 14)
      expect(b.filter((c) => c.mine).length).toBe(10)
      for (const i of [14, 7, 8, 9, 13, 15, 19, 20, 21]) expect(b[i].mine).toBe(false)
    }
  })
  it('flood-fills from a zero and reports a boom on a mine', () => {
    const b = placeMines(blank(S), S, 1, 0, () => 0.999) // the single mine lands in the last candidate
    const r = open(b, S, 0)
    expect(r.boom).toBe(false)
    expect(r.board.filter((c) => c.open).length).toBeGreaterThan(10)
    const mineIdx = b.findIndex((c) => c.mine)
    expect(open(b, S, mineIdx).boom).toBe(true)
  })
  it('flags block opening and cleared detection works', () => {
    const b = placeMines(blank(S), S, 3, 0)
    const f = toggleFlag(b, 35)
    expect(f[35].flag).toBe(true)
    expect(open(f, S, 35).board[35].open).toBe(false)
    const all = b.map((c) => ({ ...c, open: !c.mine }))
    expect(isCleared(all)).toBe(true)
  })
})
