export type Disc = 'R' | 'Y' | null
export type Board = Disc[] // 6 rows x 7 cols, row 0 = top
export const ROWS = 6, COLS = 7
const at = (b: Board, r: number, c: number) => (r < 0 || c < 0 || r >= ROWS || c >= COLS ? undefined : b[r * COLS + c])

export const empty = (): Board => Array(ROWS * COLS).fill(null)

/** Row the disc lands in, or -1 if the column is full. */
export function landingRow(b: Board, col: number): number {
  for (let r = ROWS - 1; r >= 0; r--) if (b[r * COLS + col] === null) return r
  return -1
}
export function drop(b: Board, col: number, d: Disc): Board | null {
  const r = landingRow(b, col)
  if (r < 0) return null
  const n = b.slice(); n[r * COLS + col] = d
  return n
}
export function winner(b: Board): { disc: Disc; line: number[] } | null {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
    const d = at(b, r, c)
    if (!d) continue
    for (const [dr, dc] of dirs) {
      const line = [r * COLS + c]
      for (let k = 1; k < 4; k++) { if (at(b, r + dr * k, c + dc * k) === d) line.push((r + dr * k) * COLS + c + dc * k); else break }
      if (line.length === 4) return { disc: d, line }
    }
  }
  return null
}
export const isFull = (b: Board) => b.every(Boolean)
const validCols = (b: Board) => Array.from({ length: COLS }, (_, c) => c).filter((c) => landingRow(b, c) >= 0)

function score(b: Board, me: Disc): number {
  const other: Disc = me === 'R' ? 'Y' : 'R'
  let s = 0
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]]
  for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) for (const [dr, dc] of dirs) {
    const w: Disc[] = []
    for (let k = 0; k < 4; k++) { const v = at(b, r + dr * k, c + dc * k); if (v === undefined) break; w.push(v) }
    if (w.length < 4) continue
    const m = w.filter((x) => x === me).length, o = w.filter((x) => x === other).length
    if (m && !o) s += [0, 1, 10, 100][m]
    else if (o && !m) s -= [0, 1, 10, 120][o]
  }
  for (let r = 0; r < ROWS; r++) if (at(b, r, 3) === me) s += 3
  return s
}

function minimax(b: Board, depth: number, me: Disc, turn: Disc, alpha: number, beta: number): number {
  const w = winner(b)
  if (w) return w.disc === me ? 100000 + depth : -100000 - depth
  if (depth === 0 || isFull(b)) return score(b, me)
  const next: Disc = turn === 'R' ? 'Y' : 'R'
  const cols = validCols(b).sort((a, c) => Math.abs(3 - a) - Math.abs(3 - c))
  if (turn === me) {
    let best = -Infinity
    for (const c of cols) { best = Math.max(best, minimax(drop(b, c, turn)!, depth - 1, me, next, alpha, beta)); alpha = Math.max(alpha, best); if (alpha >= beta) break }
    return best
  }
  let best = Infinity
  for (const c of cols) { best = Math.min(best, minimax(drop(b, c, turn)!, depth - 1, me, next, alpha, beta)); beta = Math.min(beta, best); if (alpha >= beta) break }
  return best
}

/** Robot column. easy = random; normal = win/block else centre-ish random; hard = minimax depth 4. */
export function robotMove(b: Board, me: Disc, skill: 'easy' | 'normal' | 'hard', rnd = Math.random): number {
  const cols = validCols(b)
  const other: Disc = me === 'R' ? 'Y' : 'R'
  const pick = (a: number[]) => a[Math.floor(rnd() * a.length)]
  if (skill === 'easy') return pick(cols)
  const winning = cols.filter((c) => winner(drop(b, c, me)!)?.disc === me)
  if (winning.length) return pick(winning)
  const blocking = cols.filter((c) => winner(drop(b, c, other)!)?.disc === other)
  if (blocking.length) return pick(blocking)
  if (skill === 'normal') return pick(cols.flatMap((c) => Array(4 - Math.abs(3 - c)).fill(c)))
  let best = -Infinity, bestCols: number[] = []
  for (const c of cols) {
    const v = minimax(drop(b, c, me)!, 4, me, other, -Infinity, Infinity)
    if (v > best) { best = v; bestCols = [c] } else if (v === best) bestCols.push(c)
  }
  return pick(bestCols)
}
