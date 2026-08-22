import { useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { colClues, generate, rowClues, solves } from './logic'
import { sfx } from '@/shared/audio'

const SIZE = { easy: 5, normal: 8, hard: 10 }
type Mark = 0 | 1 | 2 // empty, filled, X

export default function NonogramGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const n = SIZE[difficulty]
  const target = useMemo(() => generate(n), [n])
  const rows = useMemo(() => rowClues(target), [target])
  const cols = useMemo(() => colClues(target), [target])
  const [grid, setGrid] = useState<Mark[][]>(() => Array.from({ length: n }, () => Array(n).fill(0) as Mark[]))
  const [mode, setMode] = useState<'fill' | 'x'>('fill')
  const [done, setDone] = useState(false)
  const maxRow = Math.max(...rows.map((r) => r.length)), maxCol = Math.max(...cols.map((c) => c.length))

  const tap = (r: number, c: number) => {
    if (paused || done) return
    const g = grid.map((row) => row.slice())
    const want: Mark = mode === 'fill' ? 1 : 2
    g[r][c] = g[r][c] === want ? 0 : want
    setGrid(g); sfx.tap()
    if (solves(g.map((row) => row.map((v) => v === 1)), rows, cols)) {
      setDone(true); sfx.win(); onScore(1)
      setTimeout(() => onEnd({ score: 1, won: true, message: 'Picture revealed!', emoji: '🟩' }), 600)
    }
  }

  const cluesW = `${Math.max(2, maxRow) * 1.1}em`
  return (
    <>
      <div className="row">
        <div className="turn">🟩 {n}×{n}</div>
        <div className="seg" style={{ width: 200 }}>
          <button aria-pressed={mode === 'fill'} onClick={() => { sfx.tap(); setMode('fill') }}>⬛ Fill</button>
          <button aria-pressed={mode === 'x'} onClick={() => { sfx.tap(); setMode('x') }}>✖ Mark</button>
        </div>
      </div>
      <div className={`nono ${done ? 'solved' : ''}`} style={{ gridTemplateColumns: `${cluesW} repeat(${n}, 1fr)`, gridTemplateRows: `${Math.max(2, maxCol) * 1.1}em repeat(${n}, 1fr)` }} role="grid" aria-label="Nonogram">
        <div className="corner" />
        {cols.map((c, j) => <div key={`c${j}`} className="clue col" aria-label={`Column ${j + 1}: ${c.join(' ')}`}>{c.map((v, k) => <span key={k}>{v}</span>)}</div>)}
        {grid.map((row, r) => (
          [<div key={`r${r}`} className="clue" aria-label={`Row ${r + 1}: ${rows[r].join(' ')}`}>{rows[r].map((v, k) => <span key={k}>{v}</span>)}</div>,
           ...row.map((v, c) => (
             <button key={`${r},${c}`} className={`cell ${v === 1 ? 'fill' : ''} ${(c + 1) % 5 === 0 && c < n - 1 ? 'thick-r' : ''} ${(r + 1) % 5 === 0 && r < n - 1 ? 'thick-b' : ''}`} onClick={() => tap(r, c)} aria-label={v === 1 ? 'filled' : v === 2 ? 'marked empty' : 'empty'}>
               {v === 2 ? '✖' : ''}
             </button>
           ))]
        ))}
      </div>
    </>
  )
}
