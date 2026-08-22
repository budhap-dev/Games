import type { Dir } from '@/shared/useInput'
export type Grid = number[][] // 0 = empty

export const empty = (n: number): Grid => Array.from({ length: n }, () => Array(n).fill(0))

function slideRow(row: number[]): { row: number[]; gained: number } {
  const vals = row.filter((v) => v)
  const out: number[] = []
  let gained = 0
  for (let i = 0; i < vals.length; i++) {
    if (vals[i] === vals[i + 1]) { out.push(vals[i] * 2); gained += vals[i] * 2; i++ } else out.push(vals[i])
  }
  while (out.length < row.length) out.push(0)
  return { row: out, gained }
}

const rotate = (g: Grid): Grid => g[0].map((_, c) => g.map((row) => row[c]).reverse()) // clockwise

/** Slide the whole grid in a direction. Returns new grid, points gained and whether anything moved. */
export function slide(g: Grid, dir: Dir): { grid: Grid; gained: number; moved: boolean } {
  // normalise to "left": rotate so that `dir` becomes left, slide, rotate back
  const turns = { left: 0, up: 1, right: 2, down: 3 }[dir]
  let work = g
  for (let i = 0; i < turns; i++) work = rotate(rotate(rotate(work))) // counter-clockwise
  let gained = 0
  const slid = work.map((row) => { const r = slideRow(row); gained += r.gained; return r.row })
  let back = slid
  for (let i = 0; i < turns; i++) back = rotate(back)
  const moved = back.some((row, r) => row.some((v, c) => v !== g[r][c]))
  return { grid: back, gained, moved }
}

export function addRandom(g: Grid, rnd: () => number = Math.random): Grid {
  const free: [number, number][] = []
  g.forEach((row, r) => row.forEach((v, c) => { if (!v) free.push([r, c]) }))
  if (!free.length) return g
  const [r, c] = free[Math.floor(rnd() * free.length)]
  const n = g.map((row) => row.slice()); n[r][c] = rnd() < 0.9 ? 2 : 4
  return n
}
export const canMove = (g: Grid) => (['left', 'up', 'right', 'down'] as Dir[]).some((d) => slide(g, d).moved)
export const maxTile = (g: Grid) => Math.max(...g.flat())
