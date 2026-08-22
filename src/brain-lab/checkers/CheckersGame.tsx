import { useEffect, useState } from 'react'
import type { GameProps } from '@/games/types'
import { N, applyMove, countSide, initial, legalMoves, robotMove, sideOf, winner } from './logic'
import type { Board, Move } from './logic'
import { sfx } from '@/shared/audio'

const ICON: Record<string, string> = { r: '🔴', R: '👑', b: '⚫', B: '🖤' }

export default function CheckersGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [board, setBoard] = useState<Board>(initial)
  const [turn, setTurn] = useState<'r' | 'b'>('r')
  const [sel, setSel] = useState<number | null>(null)
  const [last, setLast] = useState<number[]>([])
  const [done, setDone] = useState(false)
  const moves = legalMoves(board, turn)

  const finish = (b: Board, next: 'r' | 'b') => {
    const w = winner(b, next)
    if (!w) return false
    setDone(true)
    const won = w === 'r'
    onScore(won ? 1 : 0)
    setTimeout(() => onEnd({ score: won ? 1 : 0, won, message: won ? 'You win! King of the board 👑' : 'The robot wins this one', emoji: won ? '🏆' : '🤖' }), 900)
    return true
  }
  const play = (m: Move) => {
    const nb = applyMove(board, m)
    setBoard(nb); setLast(m.path); setSel(null)
    m.captures.length ? sfx.pop() : sfx.flip()
    const next = turn === 'r' ? 'b' : 'r'
    if (!finish(nb, next)) setTurn(next)
  }
  useEffect(() => {
    if (turn !== 'b' || done || paused) return
    const t = setTimeout(() => { const m = robotMove(board, 'b', difficulty); if (m) play(m) }, 650)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, done, paused, board])

  const dests = sel === null ? [] : moves.filter((m) => m.path[0] === sel).map((m) => m.path[m.path.length - 1])
  const tap = (i: number) => {
    if (paused || done || turn !== 'r') return
    if (sideOf(board[i]) === 'r' && moves.some((m) => m.path[0] === i)) { sfx.tap(); setSel(i); return }
    if (sel !== null && dests.includes(i)) { play(moves.find((m) => m.path[0] === sel && m.path[m.path.length - 1] === i)!); return }
    if (sel !== null) { setSel(null) }
  }
  return (
    <>
      <div className="turn" aria-live="polite">{done ? '✨' : turn === 'r' ? `🔴 your move${moves[0]?.captures.length ? ' — capture!' : ''}` : '🤖 thinking…'} · 🔴 {countSide(board, 'r')} ⚫ {countSide(board, 'b')}</div>
      <div className="checkers" role="grid" aria-label="Checkers board">
        {board.map((p, i) => {
          const r = Math.floor(i / N), c = i % N
          return (
            <button key={i} className={`${(r + c) % 2 ? 'dark' : 'light'} ${sel === i ? 'sel' : ''} ${dests.includes(i) ? 'dest' : ''} ${last.includes(i) ? 'last' : ''}`} onClick={() => tap(i)} aria-label={p ? ICON[p] : dests.includes(i) ? 'move here' : ''}>
              {p ? ICON[p] : ''}
            </button>
          )
        })}
      </div>
    </>
  )
}
