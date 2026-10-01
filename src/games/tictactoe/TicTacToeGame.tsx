import { useEffect, useRef, useState } from 'react'
import type { GameProps, GameStep } from '../types'
import { isFull, robotMove, squareName, winner } from './logic'
import type { Board, Mark } from './logic'
import { sfx } from '@/shared/audio'

const ICON: Record<'X' | 'O', string> = { X: '🐱', O: '🍎' }

export default function TicTacToeGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [mode, setMode] = useState<'robot' | 'friend'>('robot')
  const [board, setBoard] = useState<Board>(Array(9).fill(null))
  const [turn, setTurn] = useState<'X' | 'O'>('X')
  const [done, setDone] = useState(false)
  const [winLine, setWinLine] = useState<number[]>([])
  const steps = useRef<GameStep[]>([])

  const finish = (b: Board) => {
    const w = winner(b)
    if (w) {
      setWinLine(w.line); setDone(true)
      const humanWon = mode === 'friend' || w.mark === 'X'
      onScore(humanWon ? 1 : 0)
      const last = steps.current.length - 1
      const st = steps.current.map((x, k) => k === last ? { ...x, result: '3 in a row!', ok: true } : x)
      setTimeout(() => onEnd({
        score: humanWon ? 1 : 0, won: humanWon,
        message: mode === 'friend' ? `${ICON[w.mark!]} wins!` : w.mark === 'X' ? 'You win!' : 'Robot wins this time!',
        emoji: humanWon ? '🏆' : '🤖', steps: st, stepsTitle: 'Moves',
      }), 900)
      return true
    }
    if (isFull(b)) {
      setDone(true)
      const st = [...steps.current]
      setTimeout(() => onEnd({ score: 0, won: false, message: "It's a draw!", emoji: '🤝', steps: st, stepsTitle: 'Moves' }), 700)
      return true
    }
    return false
  }

  const place = (i: number, mark: Mark) => {
    const nb = board.slice(); nb[i] = mark
    setBoard(nb)
    steps.current.push({ who: mode === 'friend' ? ICON[mark!] : mark === 'X' ? 'You' : 'Robot', move: squareName(i) })
    sfx.flip()
    if (!finish(nb)) setTurn(mark === 'X' ? 'O' : 'X')
  }

  // Robot's turn
  useEffect(() => {
    if (mode !== 'robot' || turn !== 'O' || done || paused) return
    const t = setTimeout(() => place(robotMove(board, 'O', difficulty), 'O'), 550)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, mode, done, paused, board])

  const humanTurn = mode === 'friend' || turn === 'X'
  const started = board.some(Boolean)

  return (
    <>
      {!started && (
        <div className="seg" role="group" aria-label="Who to play" style={{ width: 'min(100%, 320px)' }}>
          <button aria-pressed={mode === 'robot'} onClick={() => { sfx.tap(); setMode('robot') }}>🤖 Robot</button>
          <button aria-pressed={mode === 'friend'} onClick={() => { sfx.tap(); setMode('friend') }}>🧑‍🤝‍🧑 Friend</button>
        </div>
      )}
      <div className="turn" aria-live="polite">
        {done ? '✨' : humanTurn ? `${ICON[turn]} your turn` : '🤖 thinking…'}
      </div>
      <div className="board" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {board.map((m, i) => (
          <button
            key={i}
            className={`cell ${winLine.includes(i) ? 'win' : ''}`}
            disabled={!!m || done || !humanTurn || paused}
            onClick={() => place(i, turn)}
            aria-label={m ? (m === 'X' ? 'Cat' : 'Apple') : `Empty square ${i + 1}`}
          >
            {m ? ICON[m] : ''}
          </button>
        ))}
      </div>
    </>
  )
}
