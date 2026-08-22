import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '@/games/types'
import { blank, isCleared, open, openCount, placeMines, toggleFlag } from './logic'
import type { Board } from './logic'
import { sfx } from '@/shared/audio'

const CONFIG = { easy: { rows: 8, cols: 8, mines: 10 }, normal: { rows: 10, cols: 10, mines: 16 }, hard: { rows: 12, cols: 12, mines: 28 } }

export default function MinesweeperGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const shape = { rows: cfg.rows, cols: cfg.cols }
  const [board, setBoard] = useState<Board>(() => blank(shape))
  const [started, setStarted] = useState(false)
  const [flagMode, setFlagMode] = useState(false)
  const [done, setDone] = useState<'win' | 'boom' | null>(null)
  const [secs, setSecs] = useState(0)
  const pressT = useRef<number>(0)
  const longPressed = useRef(false)

  useEffect(() => {
    if (!started || done || paused) return
    const t = setInterval(() => setSecs((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [started, done, paused])

  const reveal = (i: number) => {
    if (paused || done) return
    let b = board
    if (!started) { b = placeMines(blank(shape), shape, cfg.mines, i); setStarted(true) }
    if (b[i].flag) return
    const r = open(b, shape, i)
    setBoard(r.board)
    if (r.boom) {
      setDone('boom'); sfx.bad()
      const shown = r.board.map((c) => (c.mine ? { ...c, open: true } : c)); setBoard(shown)
      const cleared = openCount(r.board)
      setTimeout(() => onEnd({ score: cleared, won: false, message: `Boom! ${cleared} squares cleared`, emoji: '💥' }), 900)
      return
    }
    sfx.flip(); onScore(openCount(r.board))
    if (isCleared(r.board)) {
      setDone('win'); sfx.win()
      setTimeout(() => onEnd({ score: openCount(r.board), won: true, message: `Board cleared in ${secs}s!`, emoji: '🏅' }), 600)
    }
  }
  const flag = (i: number) => { if (paused || done || board[i].open) return; sfx.tap(); setBoard(toggleFlag(board, i)) }

  const flagsLeft = cfg.mines - board.filter((c) => c.flag).length
  return (
    <>
      <div className="row" style={{ width: 'min(100%, 64vh, 460px)', justifyContent: 'space-between' }}>
        <div className="turn">🚩 {flagsLeft}</div>
        <button className={`btn ${flagMode ? 'sky' : ''}`} onClick={() => { sfx.tap(); setFlagMode((f) => !f) }} aria-pressed={flagMode}>{flagMode ? '🚩 Flag mode' : '👆 Reveal mode'}</button>
        <div className="turn">⏱ {secs}s</div>
      </div>
      <div className="mines" style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)` }} role="grid" aria-label="Minesweeper board" onContextMenu={(e) => e.preventDefault()}>
        {board.map((c, i) => (
          <button
            key={i}
            className={`${c.open ? 'open' : ''} ${c.open && c.mine ? (done === 'boom' ? 'mine' : '') : ''} ${c.open && c.n ? `n${c.n}` : ''}`}
            onPointerDown={() => { pressT.current = Date.now(); longPressed.current = false; window.setTimeout(() => { if (Date.now() - pressT.current >= 450 && pressT.current) { longPressed.current = true; flag(i) } }, 460) }}
            onPointerUp={() => { const short = Date.now() - pressT.current < 450; pressT.current = 0; if (!short || longPressed.current) return; flagMode ? flag(i) : reveal(i) }}
            onPointerLeave={() => { pressT.current = 0 }}
            onContextMenu={(e) => { e.preventDefault(); flag(i) }}
            aria-label={c.open ? (c.mine ? 'mine' : c.n ? `${c.n}` : 'empty') : c.flag ? 'flag' : 'hidden'}
          >
            {c.open ? (c.mine ? '💣' : c.n || '') : c.flag ? '🚩' : ''}
          </button>
        ))}
      </div>
    </>
  )
}
