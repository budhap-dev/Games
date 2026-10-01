import { randInt } from '@/shared/random'
import type { Difficulty } from '@/shared/store'

export type Mirror = '/' | '\\'
export type Mirrors = Record<number, Mirror>
/** East, south, west, north as [row, col] steps. */
export const DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]] as const

export interface Puzzle {
  n: number
  /** The laser enters from the left edge on this row, heading east */
  row: number
  targets: number[]
  /** Mirrors in an orientation that solves it (other solutions may exist) */
  solution: Mirrors
  start: Mirrors
  /** Mirrors that differ between start and solution — a fair "par" for taps */
  par: number
}

/** Angle of reflection = angle of incidence: '/' swaps east↔north and west↔south; '\' swaps east↔south and west↔north. */
export function reflect(m: Mirror, dir: number): number {
  const [dr, dc] = DIRS[dir]
  const [nr, nc] = m === '/' ? [-dc, -dr] : [dc, dr]
  return DIRS.findIndex(([a, b]) => a === nr && b === nc)
}

/** Cells the beam crosses, in order, and the direction it leaves the grid. */
export function trace(n: number, row: number, mirrors: Mirrors): { cells: number[]; dir: number } {
  const cells: number[] = []
  let r = row, c = 0, dir = 0
  for (let guard = 0; guard < 4 * n * n && r >= 0 && r < n && c >= 0 && c < n; guard++) {
    const i = r * n + c
    cells.push(i)
    const m = mirrors[i]
    if (m) dir = reflect(m, dir)
    r += DIRS[dir][0]; c += DIRS[dir][1]
  }
  return { cells, dir }
}

export const litTargets = (p: Puzzle, mirrors: Mirrors) => { const on = new Set(trace(p.n, p.row, mirrors).cells); return p.targets.filter((t) => on.has(t)) }
export const solved = (p: Puzzle, mirrors: Mirrors) => litTargets(p, mirrors).length === p.targets.length
export const flip = (m: Mirror): Mirror => (m === '/' ? '\\' : '/')

const CFG: Record<Difficulty, { n: number; turns: number; targets: number; decoys: number }> = {
  easy: { n: 5, turns: 2, targets: 1, decoys: 1 },
  normal: { n: 6, turns: 3, targets: 1, decoys: 2 },
  hard: { n: 7, turns: 4, targets: 2, decoys: 3 },
}

/** Walk a self-avoiding beam path, dropping a mirror at each turn; then add decoys and scramble. */
export function makePuzzle(d: Difficulty, rnd: () => number = Math.random): Puzzle {
  const { n, turns, targets: nTargets, decoys } = CFG[d]
  for (;;) {
    const row = randInt(n, rnd)
    const solution: Mirrors = {}
    const seen = new Set<number>(), path: number[] = []
    let r = row, c = 0, dir = 0, t = 0, ok = false
    while (r >= 0 && r < n && c >= 0 && c < n && !seen.has(r * n + c)) {
      const i = r * n + c
      seen.add(i); path.push(i)
      if (t < turns && path.length > 1 && rnd() < 0.4) {
        const nd = (dir + (rnd() < 0.5 ? 1 : 3)) % 4
        solution[i] = reflect('/', dir) === nd ? '/' : '\\'
        dir = nd; t++
      } else if (t === turns && path.length > 2 && rnd() < 0.3) { ok = true; break }
      r += DIRS[dir][0]; c += DIRS[dir][1]
    }
    if (!ok) continue
    const end = path[path.length - 1]
    const firstTurn = path.findIndex((i) => solution[i])
    const mids = path.slice(firstTurn + 1, -1).filter((i) => !solution[i])
    if (nTargets > 1 && !mids.length) continue
    const targets = nTargets > 1 ? [mids[randInt(mids.length, rnd)], end] : [end]
    const beam = new Set(trace(n, row, solution).cells)
    const free = Array.from({ length: n * n }, (_, i) => i).filter((i) => !beam.has(i))
    for (let k = 0; k < decoys && free.length; k++) solution[free.splice(randInt(free.length, rnd), 1)[0]] = rnd() < 0.5 ? '/' : '\\'
    const p: Puzzle = { n, row, targets, solution, start: {}, par: 0 }
    for (let guard = 0; guard < 50; guard++) {
      const start: Mirrors = {}
      for (const [k, m] of Object.entries(solution)) start[+k] = rnd() < 0.5 ? flip(m) : m
      if (!solved(p, start)) {
        p.start = start
        p.par = path.filter((i) => solution[i] && start[i] !== solution[i]).length
        return p
      }
    }
  }
}

/** Points for one puzzle: 10, minus one per tap beyond par, never below 3. */
export const puzzlePoints = (taps: number, par: number) => Math.max(3, 10 - Math.max(0, taps - par))
