import { useEffect, useMemo, useState } from 'react'
import type { GameProps } from '../types'
import { allMoves, applyMove, createBoard, movesFrom, pegCount } from './logic'
import type { Board } from './logic'
import { sfx } from '@/shared/audio'

export default function BrainvitaGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const variant = difficulty === 'hard' ? 'european' : 'english'
  const start = useMemo(() => createBoard(variant), [variant])
  const [history, setHistory] = useState<Board[]>([start])
  const board = history[history.length - 1]
  const [sel, setSel] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const total = pegCount(start)
  const left = pegCount(board)
  const moves = useMemo(() => allMoves(board), [board])
  const targets = sel === null ? [] : movesFrom(board, sel).map((m) => m.to)
  const showHints = difficulty === 'easy'
  const movable = useMemo(() => new Set(moves.map((m) => m.from)), [moves])

  useEffect(() => {
    if (done || moves.length > 0) return
    setDone(true)
    const cleared = total - left
    onScore(cleared)
    const won = left === 1
    if (won) sfx.win(); else sfx.good()
    setTimeout(() => onEnd({
      score: cleared, won,
      message: won ? 'Perfect! One gem left!' : left <= 3 ? `So close! ${left} gems left` : `${left} gems left. Try again?`,
      emoji: won ? '💎' : '✨',
    }), 500)
  }, [moves, done, left, total, onScore, onEnd])

  const tap = (i: number) => {
    if (paused || done) return
    if (board[i] === true) { sfx.tap(); setSel(sel === i ? null : i); return }
    if (sel !== null && targets.includes(i)) {
      const m = movesFrom(board, sel).find((x) => x.to === i)!
      sfx.pop()
      setHistory((h) => [...h, applyMove(board, m)])
      setSel(null)
      onScore(total - left + 1)
    }
  }
  const undo = () => {
    if (history.length < 2 || done) return
    sfx.tap()
    setHistory((h) => h.slice(0, -1))
    setSel(null)
    onScore(total - pegCount(history[history.length - 2]))
  }

  return (
    <>
      <div className="row">
        <div className="turn">💎 {left} left</div>
        <button className="btn" onClick={undo} disabled={history.length < 2}>↩ Undo</button>
      </div>
      <div className="peg-board" role="grid" aria-label="Brainvita board">
        {board.map((cell, i) => {
          const cls = cell === null ? 'none' : [cell ? 'peg' : 'hole', sel === i ? 'sel' : '', targets.includes(i) ? 'target' : '', showHints && sel === null && movable.has(i) ? 'hint' : ''].join(' ')
          return (
            <button key={i} className={cls} onClick={() => tap(i)} aria-label={cell === null ? '' : cell ? 'gem' : 'empty hole'} tabIndex={cell === null ? -1 : 0}>
              {cell ? '💎' : ''}
            </button>
          )
        })}
      </div>
    </>
  )
}
