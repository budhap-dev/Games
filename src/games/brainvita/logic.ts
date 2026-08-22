/** Peg solitaire. Board is 7x7; null = not a hole, true = gem, false = empty hole. */
export type Cell = boolean | null
export type Board = Cell[]
export interface Move { from: number; over: number; to: number }
export type Variant = 'english' | 'european'

const idx = (r: number, c: number) => r * 7 + c

export function createBoard(variant: Variant = 'english'): Board {
  const b: Board = []
  for (let r = 0; r < 7; r++) for (let c = 0; c < 7; c++) {
    const cross = (r >= 2 && r <= 4) || (c >= 2 && c <= 4)
    const euro = variant === 'european' && Math.abs(r - 3) + Math.abs(c - 3) <= 4 && r > 0 && r < 6 && c > 0 && c < 6
    b.push(cross || euro ? true : null)
  }
  b[idx(3, 3)] = false
  return b
}

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]

export function movesFrom(b: Board, from: number): Move[] {
  if (b[from] !== true) return []
  const r = Math.floor(from / 7), c = from % 7
  const out: Move[] = []
  for (const [dr, dc] of DIRS) {
    const r1 = r + dr, c1 = c + dc, r2 = r + dr * 2, c2 = c + dc * 2
    if (r2 < 0 || c2 < 0 || r2 > 6 || c2 > 6) continue
    const over = idx(r1, c1), to = idx(r2, c2)
    if (b[over] === true && b[to] === false) out.push({ from, over, to })
  }
  return out
}

export const allMoves = (b: Board): Move[] => b.flatMap((_, i) => movesFrom(b, i))

export function applyMove(b: Board, m: Move): Board {
  const n = b.slice()
  n[m.from] = false; n[m.over] = false; n[m.to] = true
  return n
}

export const pegCount = (b: Board) => b.filter((x) => x === true).length
