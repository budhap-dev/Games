export type Mark = 'X' | 'O' | null
export type Board = Mark[]

const LINES = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]

export function winner(b: Board): { mark: Mark; line: number[] } | null {
  for (const l of LINES) {
    const [a, c, d] = l
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return { mark: b[a], line: l }
  }
  return null
}
export const isFull = (b: Board) => b.every(Boolean)
const empties = (b: Board) => b.map((m, i) => (m ? -1 : i)).filter((i) => i >= 0)

function minimax(b: Board, me: 'X' | 'O', turn: 'X' | 'O'): number {
  const w = winner(b)
  if (w) return w.mark === me ? 1 : -1
  if (isFull(b)) return 0
  const scores = empties(b).map((i) => {
    const nb = b.slice(); nb[i] = turn
    return minimax(nb, me, turn === 'X' ? 'O' : 'X')
  })
  return turn === me ? Math.max(...scores) : Math.min(...scores)
}

/** Robot move. easy = random; normal = win/block else random; hard = perfect. */
export function robotMove(b: Board, me: 'X' | 'O', skill: 'easy' | 'normal' | 'hard', rnd = Math.random): number {
  const e = empties(b)
  const other: 'X' | 'O' = me === 'X' ? 'O' : 'X'
  const pick = (arr: number[]) => arr[Math.floor(rnd() * arr.length)]
  if (skill === 'easy') return pick(e)
  const winning = e.filter((i) => { const nb = b.slice(); nb[i] = me; return winner(nb) })
  if (winning.length) return pick(winning)
  const blocking = e.filter((i) => { const nb = b.slice(); nb[i] = other; return winner(nb) })
  if (blocking.length) return pick(blocking)
  if (skill === 'normal') return b[4] === null && rnd() < 0.6 ? 4 : pick(e)
  let best = -Infinity, moves: number[] = []
  for (const i of e) {
    const nb = b.slice(); nb[i] = me
    const s = minimax(nb, me, other)
    if (s > best) { best = s; moves = [i] } else if (s === best) moves.push(i)
  }
  return pick(moves)
}
