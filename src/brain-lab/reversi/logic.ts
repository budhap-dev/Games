export const N = 8
export type Side = 'b' | 'w'
export type Board = (Side | null)[]
export interface Move { i: number; flips: number[] }

const DIRS = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
/** Board index → square name: columns a–h left→right, rows 8→1 top→bottom. */
export const square = (i: number) => 'abcdefgh'[i % N] + (N - Math.floor(i / N))
export const other = (s: Side): Side => (s === 'b' ? 'w' : 'b')

export function initial(): Board {
  const b: Board = Array(N * N).fill(null)
  b[3 * N + 3] = 'w'; b[4 * N + 4] = 'w'; b[3 * N + 4] = 'b'; b[4 * N + 3] = 'b'
  return b
}

/** Discs that placing `me` at `i` would flip (empty if the move is illegal). */
export function flipsFor(b: Board, i: number, me: Side): number[] {
  if (b[i]) return []
  const r0 = Math.floor(i / N), c0 = i % N, out: number[] = []
  for (const [dr, dc] of DIRS) {
    const run: number[] = []
    let r = r0 + dr, c = c0 + dc
    while (r >= 0 && r < N && c >= 0 && c < N && b[r * N + c] === other(me)) { run.push(r * N + c); r += dr; c += dc }
    if (run.length && r >= 0 && r < N && c >= 0 && c < N && b[r * N + c] === me) out.push(...run)
  }
  return out
}

export function legalMoves(b: Board, me: Side): Move[] {
  const out: Move[] = []
  for (let i = 0; i < N * N; i++) { const flips = flipsFor(b, i, me); if (flips.length) out.push({ i, flips }) }
  return out
}

export function applyMove(b: Board, m: Move, me: Side): Board {
  const nb = b.slice()
  nb[m.i] = me
  for (const f of m.flips) nb[f] = me
  return nb
}

export const count = (b: Board, s: Side) => b.filter((p) => p === s).length
/** Game over when neither side can move. */
export const isOver = (b: Board) => !legalMoves(b, 'b').length && !legalMoves(b, 'w').length

// Classic positional weights: corners great, squares next to corners risky.
const W = [
  100, -20, 10, 5, 5, 10, -20, 100,
  -20, -40, -2, -2, -2, -2, -40, -20,
  10, -2, 1, 1, 1, 1, -2, 10,
  5, -2, 1, 0, 0, 1, -2, 5,
  5, -2, 1, 0, 0, 1, -2, 5,
  10, -2, 1, 1, 1, 1, -2, 10,
  -20, -40, -2, -2, -2, -2, -40, -20,
  100, -20, 10, 5, 5, 10, -20, 100,
]
function evaluate(b: Board, me: Side): number {
  if (isOver(b)) { const d = count(b, me) - count(b, other(me)); return d > 0 ? 10000 + d : d < 0 ? -10000 + d : 0 }
  let pos = 0
  for (let i = 0; i < N * N; i++) if (b[i]) pos += b[i] === me ? W[i] : -W[i]
  return pos + 5 * (legalMoves(b, me).length - legalMoves(b, other(me)).length)
}
function minimax(b: Board, depth: number, toMove: Side, me: Side, alpha: number, beta: number): number {
  if (depth === 0 || isOver(b)) return evaluate(b, me)
  const moves = legalMoves(b, toMove)
  if (!moves.length) return minimax(b, depth - 1, other(toMove), me, alpha, beta) // pass
  if (toMove === me) {
    let v = -Infinity
    for (const m of moves) { v = Math.max(v, minimax(applyMove(b, m, toMove), depth - 1, other(toMove), me, alpha, beta)); alpha = Math.max(alpha, v); if (alpha >= beta) break }
    return v
  }
  let v = Infinity
  for (const m of moves) { v = Math.min(v, minimax(applyMove(b, m, toMove), depth - 1, other(toMove), me, alpha, beta)); beta = Math.min(beta, v); if (alpha >= beta) break }
  return v
}

/** Easy: random. Normal: best positional square (corners first). Hard: 4-ply alpha-beta search. */
export function robotMove(b: Board, me: Side, skill: 'easy' | 'normal' | 'hard', rnd = Math.random): Move | null {
  const moves = legalMoves(b, me)
  if (!moves.length) return null
  const pick = (a: Move[]) => a[Math.floor(rnd() * a.length)]
  if (skill === 'easy') return pick(moves)
  const score = (m: Move) => (skill === 'normal' ? W[m.i] * 10 + m.flips.length : minimax(applyMove(b, m, me), 3, other(me), me, -Infinity, Infinity))
  let bestV = -Infinity, best: Move[] = []
  for (const m of moves) { const v = score(m); if (v > bestV) { bestV = v; best = [m] } else if (v === bestV) best.push(m) }
  return pick(best)
}
