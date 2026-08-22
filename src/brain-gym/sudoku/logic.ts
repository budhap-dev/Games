export type Grid = number[] // 0 = empty, 1..n
export interface Shape { n: number; boxR: number; boxC: number }
export const SHAPES: Record<4 | 6, Shape> = { 4: { n: 4, boxR: 2, boxC: 2 }, 6: { n: 6, boxR: 2, boxC: 3 } }

const shuffle = <T,>(a: T[], rnd: () => number) => {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

export const boxOf = (s: Shape, r: number, c: number) => Math.floor(r / s.boxR) * (s.n / s.boxC) + Math.floor(c / s.boxC)

export function canPlace(g: Grid, s: Shape, idx: number, v: number): boolean {
  const r = Math.floor(idx / s.n), c = idx % s.n
  for (let i = 0; i < s.n; i++) {
    if (i !== c && g[r * s.n + i] === v) return false
    if (i !== r && g[i * s.n + c] === v) return false
  }
  const b = boxOf(s, r, c)
  for (let i = 0; i < g.length; i++) {
    if (i !== idx && g[i] === v && boxOf(s, Math.floor(i / s.n), i % s.n) === b) return false
  }
  return true
}

export function solve(g: Grid, s: Shape, rnd: () => number = Math.random): Grid | null {
  const idx = g.indexOf(0)
  if (idx < 0) return g
  for (const v of shuffle(Array.from({ length: s.n }, (_, i) => i + 1), rnd)) {
    if (canPlace(g, s, idx, v)) {
      g[idx] = v
      const r = solve(g, s, rnd)
      if (r) return r
      g[idx] = 0
    }
  }
  return null
}

export function generate(s: Shape, holes: number, rnd: () => number = Math.random): { puzzle: Grid; solution: Grid } {
  const solution = solve(Array(s.n * s.n).fill(0), s, rnd)!
  const puzzle = solution.slice()
  for (const i of shuffle(puzzle.map((_, i) => i), rnd).slice(0, holes)) puzzle[i] = 0
  return { puzzle, solution }
}

/** Set of cell indexes that conflict with another cell (same value in row/col/box). */
export function conflicts(g: Grid, s: Shape): Set<number> {
  const bad = new Set<number>()
  for (let i = 0; i < g.length; i++) if (g[i] && !canPlace(g, s, i, g[i])) bad.add(i)
  return bad
}

export const isSolved = (g: Grid, s: Shape) => g.every(Boolean) && conflicts(g, s).size === 0
