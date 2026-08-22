import { describe, it, expect } from 'vitest'
import { cellAt, cellCenter, cluster, get, setCell, snapCell } from '@/games/bubblepop/logic'
import type { Grid } from '@/games/bubblepop/logic'

// Reproduce the game's landing: fly a ball from the shooter toward a target bubble; when within 1.85r of any bubble, snap.
function simulate(grid: Grid, cols: number, targetR: number, targetC: number, size: number, angleJitter: number) {
  const shape = { cols, shift: 0 }, r = size / (cols * 2 + 1)
  const [tx, ty] = cellCenter(targetR, targetC, r, shape)
  const sx = size / 2, sy = size - r * 1.4
  const ang = Math.atan2(ty - sy, tx - sx) + angleJitter
  let x = sx, y = sy; const sp = size * 0.022, vx = Math.cos(ang) * sp, vy = Math.sin(ang) * sp
  for (let i = 0; i < 2000; i++) {
    x += vx; y += vy
    if (x < r || x > size - r || y <= r) return null
    let hit: [number, number] | null = null
    outer: for (let ri = 0; ri < grid.length; ri++) for (let ci = 0; ci < cols; ci++) {
      if (get(grid, ri, ci) === null) continue
      const [cx, cy] = cellCenter(ri, ci, r, shape)
      if ((cx - x) ** 2 + (cy - y) ** 2 < (r * 1.85) ** 2) { hit = [ri, ci]; break outer }
    }
    if (hit) {
      let [row, col] = cellAt(x, y, r, shape)
      ;[row, col] = snapCell(grid, row, col, shape, r, x, y)
      const g2 = setCell(grid, row, col, 0)
      return { hit, landed: [row, col] as [number, number], clusterSize: cluster(g2, row, col, shape).length }
    }
  }
  return null
}

describe('bubble pop landing (dense grids)', () => {
  it('on dense random grids, touching a same-colour bubble always joins it', () => {
    const cols = 9, size = 360, shape = { cols, shift: 0 }, r = size / (cols * 2 + 1)
    let rnd = 12345; const rand = () => ((rnd = (rnd * 1103515245 + 12345) % 2147483648) / 2147483648)
    let fails = 0, total = 0, touched = 0
    for (let trial = 0; trial < 400; trial++) {
      const grid: Grid = Array.from({ length: 5 }, () => Array.from({ length: cols }, () => Math.floor(rand() * 4)))
      // aim at a random bottom-ish bubble with jitter; shot colour 0
      const tc = Math.floor(rand() * cols), tr = 4
      const res = simulate(grid, cols, tr, tc, size, (rand() - 0.5) * 0.6)
      if (!res) continue
      total++
      // did the ball touch ANY colour-0 bubble at landing moment? (within 1.85r of its final position)
      const [lx, ly] = cellCenter(res.landed[0], res.landed[1], r, shape) // approximate: landed cell centre
      let near0 = false
      grid.forEach((row, ri) => row.forEach((v, ci) => { if (v === 0) { const [cx, cy] = cellCenter(ri, ci, r, shape); if ((cx - lx) ** 2 + (cy - ly) ** 2 <= (2 * r + 1) ** 2) near0 = true } }))
      if (near0) { touched++; if (res.clusterSize < 2) fails++ }
    }
    console.log(`dense: shots=${total} touchedSame=${touched} noPop=${fails}`)
    expect(fails).toBe(0)
  })
})

describe('bubble pop landing (current logic)', () => {
  it('a shot that touches a same-colour bubble always joins its cluster', () => {
    const cols = 9, size = 360
    let fails = 0, total = 0
    for (let c = 0; c < cols; c++) for (let j = -0.25; j <= 0.25; j += 0.0125) {
      const grid: Grid = [Array.from({ length: cols }, (_, i) => (i === c ? 0 : 1))] // one colour-0 target on row 0
      const res = simulate(grid, cols, 0, c, size, j)
      if (!res) continue
      total++
      const hitSame = get(grid, res.hit[0], res.hit[1]) === 0
      if (hitSame && res.clusterSize < 2) fails++
    }
    console.log(`shots=${total} touched-same-but-no-pop=${fails}`)
    expect(fails).toBe(0)
  })
})
