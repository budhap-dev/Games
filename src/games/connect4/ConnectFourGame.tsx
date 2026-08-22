import { useEffect, useState } from 'react'
import type { GameProps } from '../types'
import { COLS, drop, empty, isFull, landingRow, robotMove, winner } from './logic'
import type { Board, Disc } from './logic'
import { sfx } from '@/shared/audio'

const ICON: Record<'R' | 'Y', string> = { R: '🔴', Y: '🟡' }

export default function ConnectFourGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [mode, setMode] = useState<'robot' | 'friend'>('robot')
  const [board, setBoard] = useState<Board>(empty())
  const [turn, setTurn] = useState<'R' | 'Y'>('R')
  const [last, setLast] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const [winLine, setWinLine] = useState<number[]>([])

  const finish = (b: Board) => {
    const w = winner(b)
    if (w) {
      setWinLine(w.line); setDone(true)
      const humanWon = mode === 'friend' || w.disc === 'R'
      onScore(humanWon ? 1 : 0)
      setTimeout(() => onEnd({ score: humanWon ? 1 : 0, won: humanWon, message: mode === 'friend' ? `${ICON[w.disc!]} wins!` : w.disc === 'R' ? 'You win!' : 'Robot wins this time!', emoji: humanWon ? '🏆' : '🤖' }), 1000)
      return true
    }
    if (isFull(b)) { setDone(true); setTimeout(() => onEnd({ score: 0, won: false, message: "It's a draw!", emoji: '🤝' }), 700); return true }
    return false
  }
  const play = (col: number, d: Disc) => {
    const r = landingRow(board, col)
    if (r < 0) return
    const nb = drop(board, col, d)!
    setBoard(nb); setLast(r * COLS + col); sfx.flip()
    if (!finish(nb)) setTurn(d === 'R' ? 'Y' : 'R')
  }
  useEffect(() => {
    if (mode !== 'robot' || turn !== 'Y' || done || paused) return
    const t = setTimeout(() => play(robotMove(board, 'Y', difficulty), 'Y'), 600)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turn, mode, done, paused, board])

  const humanTurn = mode === 'friend' || turn === 'R'
  const started = board.some(Boolean)
  return (
    <>
      {!started && (
        <div className="seg" role="group" aria-label="Who to play">
          <button aria-pressed={mode === 'robot'} onClick={() => { sfx.tap(); setMode('robot') }}>🤖 Robot</button>
          <button aria-pressed={mode === 'friend'} onClick={() => { sfx.tap(); setMode('friend') }}>🧑‍🤝‍🧑 Friend</button>
        </div>
      )}
      <div className="turn" aria-live="polite">{done ? '✨' : humanTurn ? `${ICON[turn]} your turn` : '🤖 thinking…'}</div>
      <div className="c4" role="grid" aria-label="Connect Four board">
        {board.map((d, i) => (
          <button key={i} className={`${last === i ? 'drop' : ''} ${winLine.includes(i) ? 'win' : ''}`} disabled={done || !humanTurn || paused} onClick={() => play(i % COLS, turn)} aria-label={d ? (d === 'R' ? 'Red' : 'Yellow') : `Drop in column ${(i % COLS) + 1}`}>
            {d ? ICON[d] : ''}
          </button>
        ))}
      </div>
    </>
  )
}
