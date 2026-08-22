export type Grid = boolean[][]

export function clues(line: boolean[]): number[] {
  const out: number[] = []
  let run = 0
  for (const v of line) { if (v) run++; else if (run) { out.push(run); run = 0 } }
  if (run) out.push(run)
  return out.length ? out : [0]
}
export const rowClues = (g: Grid) => g.map(clues)
export const colClues = (g: Grid) => g[0].map((_, c) => clues(g.map((r) => r[c])))

export function generate(n: number, density = 0.58, rnd: () => number = Math.random): Grid {
  const g: Grid = Array.from({ length: n }, () => Array.from({ length: n }, () => rnd() < density))
  // guarantee each row/col has at least one filled cell so clues are interesting
  for (let i = 0; i < n; i++) { if (!g[i].some(Boolean)) g[i][Math.floor(rnd() * n)] = true; if (!g.some((r) => r[i])) g[Math.floor(rnd() * n)][i] = true }
  return g
}
const same = (a: number[], b: number[]) => a.length === b.length && a.every((v, i) => v === b[i])
/** The player's grid solves the puzzle if its clues match (any pattern with matching clues is accepted). */
export function solves(player: Grid, rows: number[][], cols: number[][]) {
  return rowClues(player).every((c, i) => same(c, rows[i])) && colClues(player).every((c, i) => same(c, cols[i]))
}
