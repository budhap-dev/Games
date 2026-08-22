export interface Cell { mine: boolean; open: boolean; flag: boolean; n: number }
export type Board = Cell[]
export interface Shape { rows: number; cols: number }

export const blank = (s: Shape): Board => Array.from({ length: s.rows * s.cols }, () => ({ mine: false, open: false, flag: false, n: 0 }))

export function neighbors(s: Shape, i: number): number[] {
  const r = Math.floor(i / s.cols), c = i % s.cols, out: number[] = []
  for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) {
    if (!dr && !dc) continue
    const rr = r + dr, cc = c + dc
    if (rr >= 0 && cc >= 0 && rr < s.rows && cc < s.cols) out.push(rr * s.cols + cc)
  }
  return out
}

/** Place mines avoiding `safe` and its neighbours (so the first tap always opens an area). */
export function placeMines(b: Board, s: Shape, mines: number, safe: number, rnd: () => number = Math.random): Board {
  const nb = b.map((c) => ({ ...c }))
  const avoid = new Set([safe, ...neighbors(s, safe)])
  const cands = nb.map((_, i) => i).filter((i) => !avoid.has(i))
  for (let k = 0; k < mines && cands.length; k++) {
    const j = Math.floor(rnd() * cands.length)
    nb[cands[j]].mine = true
    cands.splice(j, 1)
  }
  nb.forEach((c, i) => { c.n = neighbors(s, i).filter((j) => nb[j].mine).length })
  return nb
}

/** Open a cell (flood-fills zeros). Returns new board and whether a mine was hit. */
export function open(b: Board, s: Shape, i: number): { board: Board; boom: boolean } {
  if (b[i].open || b[i].flag) return { board: b, boom: false }
  const nb = b.map((c) => ({ ...c }))
  if (nb[i].mine) { nb[i].open = true; return { board: nb, boom: true } }
  const stack = [i]
  while (stack.length) {
    const k = stack.pop()!
    if (nb[k].open || nb[k].flag) continue
    nb[k].open = true
    if (nb[k].n === 0) for (const j of neighbors(s, k)) if (!nb[j].open && !nb[j].mine) stack.push(j)
  }
  return { board: nb, boom: false }
}

export const toggleFlag = (b: Board, i: number): Board => b.map((c, k) => (k === i && !c.open ? { ...c, flag: !c.flag } : c))
export const isCleared = (b: Board) => b.every((c) => c.mine || c.open)
export const openCount = (b: Board) => b.filter((c) => c.open && !c.mine).length
