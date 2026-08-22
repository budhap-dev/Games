import { describe, it, expect } from 'vitest'
import { cluster, floating, remove, neighbors } from './logic'
import type { Grid } from './logic'

const S = { cols: 4, shift: 0 }

describe('bubble pop', () => {
  it('finds same-colour clusters across hex neighbours', () => {
    const g: Grid = [
      [0, 0, 1, 1],
      [0, 1, 1, 2],
    ]
    expect(cluster(g, 0, 0, S).length).toBe(3) // (0,0),(0,1),(1,0)
    expect(cluster(g, 0, 2, S).length).toBe(4) // (0,2),(0,3),(1,1),(1,2)
  })
  it('detects floating bubbles after removal', () => {
    const g: Grid = [
      [0, null, null, null],
      [null, 1, null, null], // (1,1) touches (0,0)? even row0, odd row1: neighbours of (1,1) are (0,1),(0,2) -> no
    ]
    expect(floating(g, S)).toEqual([[1, 1]])
    const g2 = remove(g, [[1, 1]])
    expect(floating(g2, S)).toEqual([])
  })
  it('neighbours stay in bounds', () => {
    for (const [r, c] of neighbors(0, 0, S)) { expect(r).toBeGreaterThanOrEqual(0); expect(c).toBeGreaterThanOrEqual(0); expect(c).toBeLessThan(4) }
  })
})
