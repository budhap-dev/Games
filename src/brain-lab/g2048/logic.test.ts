import { describe, it, expect } from 'vitest'
import { addRandom, canMove, empty, slide } from './logic'

describe('2048', () => {
  it('merges pairs once per move and scores', () => {
    const g = [[2, 2, 4, 4], [0, 0, 0, 0], [2, 0, 2, 0], [4, 4, 4, 4]]
    const r = slide(g, 'left')
    expect(r.grid[0]).toEqual([4, 8, 0, 0]); expect(r.grid[2]).toEqual([4, 0, 0, 0]); expect(r.grid[3]).toEqual([8, 8, 0, 0])
    expect(r.gained).toBe(4 + 8 + 4 + 16); expect(r.moved).toBe(true)
  })
  it('slides in every direction consistently', () => {
    const g = [[0, 0, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 2]]
    expect(slide(g, 'up').grid[0]).toEqual([0, 0, 0, 4])
    expect(slide(g, 'down').grid[3]).toEqual([0, 0, 0, 4])
    expect(slide(g, 'right').moved).toBe(false)
  })
  it('detects no moves left', () => {
    const g = [[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 2]]
    expect(canMove(g)).toBe(false)
    expect(canMove(addRandom(empty(4)))).toBe(true)
  })
})
