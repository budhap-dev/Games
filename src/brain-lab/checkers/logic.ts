/** American checkers on an 8x8 board. 'r' red (human, moves up), 'b' black (robot, moves down); uppercase = king. */
export type Piece = 'r' | 'R' | 'b' | 'B' | null
export type Board = Piece[]
export type Side = 'r' | 'b'
export interface Move { path: number[]; captures: number[] }
export const N = 8
const rc = (i: number) => [Math.floor(i / N), i % N] as const
const idx = (r: number, c: number) => (r < 0 || c < 0 || r >= N || c >= N ? -1 : r * N + c)
export const sideOf = (p: Piece): Side | null => (p ? (p.toLowerCase() as Side) : null)
const isKing = (p: Piece) => p === 'R' || p === 'B'

export function initial(): Board {
  const b: Board = Array(N * N).fill(null)
  for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) {
    if ((r + c) % 2 === 1) { if (r < 3) b[r * N + c] = 'b'; else if (r > 4) b[r * N + c] = 'r' }
  }
  return b
}
function dirs(p: Piece): [number, number][] {
  if (isKing(p)) return [[-1, -1], [-1, 1], [1, -1], [1, 1]]
  return p === 'r' ? [[-1, -1], [-1, 1]] : [[1, -1], [1, 1]]
}
function jumpsFrom(b: Board, i: number, p: Piece, path: number[], caps: number[], out: Move[]) {
  const [r, c] = rc(i)
  let extended = false
  for (const [dr, dc] of dirs(p)) {
    const over = idx(r + dr, c + dc), to = idx(r + 2 * dr, c + 2 * dc)
    if (over < 0 || to < 0) continue
    const op = b[over]
    if (!op || sideOf(op) === sideOf(p) || caps.includes(over) || (b[to] && to !== path[0])) continue
    extended = true
    jumpsFrom(b, to, p, [...path, to], [...caps, over], out)
  }
  if (!extended && caps.length) out.push({ path, captures: caps })
}
/** Legal moves for a side; captures are compulsory. */
export function legalMoves(b: Board, side: Side): Move[] {
  const jumps: Move[] = [], steps: Move[] = []
  b.forEach((p, i) => {
    if (!p || sideOf(p) !== side) return
    const tmp = b.slice(); tmp[i] = null // allow landing back on start square during multi-jumps
    jumpsFrom(tmp, i, p, [i], [], jumps)
    const [r, c] = rc(i)
    for (const [dr, dc] of dirs(p)) { const to = idx(r + dr, c + dc); if (to >= 0 && !b[to]) steps.push({ path: [i, to], captures: [] }) }
  })
  return jumps.length ? jumps : steps
}
export function applyMove(b: Board, m: Move): Board {
  const n = b.slice()
  const from = m.path[0], to = m.path[m.path.length - 1]
  let p = n[from]!
  n[from] = null
  for (const c of m.captures) n[c] = null
  const [r] = rc(to)
  if (p === 'r' && r === 0) p = 'R'
  if (p === 'b' && r === N - 1) p = 'B'
  n[to] = p
  return n
}
export const countSide = (b: Board, s: Side) => b.filter((p) => sideOf(p) === s).length
export function winner(b: Board, toMove: Side): Side | null {
  const other: Side = toMove === 'r' ? 'b' : 'r'
  if (countSide(b, toMove) === 0 || legalMoves(b, toMove).length === 0) return other
  return null
}
function evaluate(b: Board, me: Side): number {
  let s = 0
  b.forEach((p, i) => { if (!p) return; const v = (isKing(p) ? 1.6 : 1) + (isKing(p) ? 0 : (sideOf(p) === 'r' ? (7 - rc(i)[0]) : rc(i)[0]) * 0.03); s += sideOf(p) === me ? v : -v })
  return s
}
function minimax(b: Board, depth: number, me: Side, turn: Side, alpha: number, beta: number): number {
  const w = winner(b, turn)
  if (w) return w === me ? 100 + depth : -100 - depth
  if (depth === 0) return evaluate(b, me)
  const moves = legalMoves(b, turn)
  const next: Side = turn === 'r' ? 'b' : 'r'
  if (turn === me) { let best = -Infinity; for (const m of moves) { best = Math.max(best, minimax(applyMove(b, m), depth - 1, me, next, alpha, beta)); alpha = Math.max(alpha, best); if (alpha >= beta) break } return best }
  let best = Infinity; for (const m of moves) { best = Math.min(best, minimax(applyMove(b, m), depth - 1, me, next, alpha, beta)); beta = Math.min(beta, best); if (alpha >= beta) break } return best
}
export function robotMove(b: Board, me: Side, skill: 'easy' | 'normal' | 'hard', rnd = Math.random): Move | null {
  const moves = legalMoves(b, me)
  if (!moves.length) return null
  const pick = (a: Move[]) => a[Math.floor(rnd() * a.length)]
  if (skill === 'easy') return pick(moves)
  if (skill === 'normal') { const best = Math.max(...moves.map((m) => m.captures.length)); return pick(moves.filter((m) => m.captures.length === best)) }
  const other: Side = me === 'r' ? 'b' : 'r'
  let bestV = -Infinity, best: Move[] = []
  for (const m of moves) { const v = minimax(applyMove(b, m), 4, me, other, -Infinity, Infinity); if (v > bestV) { bestV = v; best = [m] } else if (v === bestV) best.push(m) }
  return pick(best)
}
