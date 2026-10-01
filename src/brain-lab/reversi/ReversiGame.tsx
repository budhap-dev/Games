import { useEffect, useRef, useState } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { applyMove, count, initial, legalMoves, other, robotMove, square } from './logic'
import type { Board, Move, Side } from './logic'
import { sfx } from '@/shared/audio'

export default function ReversiGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [board, setBoard] = useState<Board>(initial)
  const [turn, setTurn] = useState<Side>('b')
  const [last, setLast] = useState<number[]>([])
  const [note, setNote] = useState('')
  const [done, setDone] = useState(false)
  const log = useRef<GameStep[]>([])
  const moves = legalMoves(board, turn)
  const hints = difficulty !== 'hard' && turn === 'b' ? moves.map((m) => m.i) : []

  const play = (m: Move) => {
    const nb = applyMove(board, m, turn)
    setBoard(nb); setLast([m.i, ...m.flips]); sfx.flip()
    const who = (s: Side) => (s === 'b' ? 'You' : 'Robot')
    log.current = [...log.current, { who: who(turn), move: square(m.i), result: `+${m.flips.length} flipped` }]
    onScore(count(nb, 'b'))
    const next = other(turn)
    if (legalMoves(nb, next).length) { setTurn(next); setNote(''); return }
    if (legalMoves(nb, turn).length) { log.current = [...log.current, { who: who(next), move: 'Pass' }]; setNote(next === 'b' ? 'You have no move — the robot goes again' : 'The robot has no move — your turn again'); return }
    setDone(true)
    const me = count(nb, 'b'), bot = count(nb, 'w')
    const won = me > bot
    setTimeout(() => onEnd({ score: me, won, message: won ? `You win ${me}–${bot}!` : me === bot ? `A draw, ${me}–${bot}` : `The robot wins ${bot}–${me}`, emoji: won ? '🏆' : me === bot ? '🤝' : '🤖', steps: log.current, stepsTitle: 'Moves' }), 900)
  }
  useEffect(() => {
    if (turn !== 'w' || done || paused) return
    const t = setTimeout(() => { const m = robotMove(board, 'w', difficulty); if (m) play(m) }, 650)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, done, paused, board])

  const tap = (i: number) => {
    if (paused || done || turn !== 'b') return
    const m = moves.find((x) => x.i === i)
    if (m) play(m); else if (!board[i]) sfx.bad()
  }
  return (
    <>
      <div className="turn" aria-live="polite">{done ? '✨' : turn === 'b' ? '⚫ your move' : '🤖 thinking…'} · ⚫ {count(board, 'b')} ⚪ {count(board, 'w')}</div>
      <div className="reversi" role="grid" aria-label="Reversi board">
        {board.map((p, i) => (
          <button key={i} className={`${hints.includes(i) ? 'hint' : ''} ${last[0] === i ? 'last' : ''}`} onClick={() => tap(i)}
            aria-label={p === 'b' ? 'black' : p === 'w' ? 'white' : hints.includes(i) ? 'move here' : 'empty'}>
            {p && <span className={`disc ${p} ${last.includes(i) ? 'pop' : ''}`} />}
          </button>
        ))}
      </div>
      {note && <div className="howto" role="status">{note}</div>}
    </>
  )
}
