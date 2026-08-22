import { useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { SHAPES, conflicts, generate, isSolved } from './logic'
import { sfx } from '@/shared/audio'

const CONFIG = {
  easy: { shape: SHAPES[4], holes: 7, symbols: ['🍎', '🍌', '🍇', '🍓'] },
  normal: { shape: SHAPES[6], holes: 16, symbols: ['🍎', '🍌', '🍇', '🍓', '🍊', '🥝'] },
  hard: { shape: SHAPES[6], holes: 22, symbols: ['1', '2', '3', '4', '5', '6'] },
}

export default function SudokuGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const { shape, symbols } = cfg
  const { puzzle } = useMemo(() => generate(shape, cfg.holes), [shape, cfg.holes])
  const [grid, setGrid] = useState(puzzle)
  const [sel, setSel] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const bad = useMemo(() => conflicts(grid, shape), [grid, shape])

  const put = (v: number) => {
    if (sel === null || puzzle[sel] || done || paused) return
    const g = grid.slice(); g[sel] = v
    setGrid(g)
    sfx.tap()
    if (isSolved(g, shape)) {
      setDone(true); sfx.good(); onScore(1)
      setTimeout(() => onEnd({ score: 1, won: true, message: 'Puzzle solved!', emoji: '🍓' }), 500)
    }
  }

  return (
    <>
      <div className="sudoku" style={{ gridTemplateColumns: `repeat(${shape.n}, 1fr)` }} role="grid" aria-label="Sudoku grid">
        {grid.map((v, i) => {
          const r = Math.floor(i / shape.n), c = i % shape.n
          const cls = [
            puzzle[i] ? 'given' : '',
            sel === i ? 'sel' : '',
            bad.has(i) ? 'bad' : '',
            (r + 1) % shape.boxR === 0 && r < shape.n - 1 ? 'box-r' : '',
            (c + 1) % shape.boxC === 0 && c < shape.n - 1 ? 'box-c' : '',
          ].join(' ')
          return (
            <button key={i} className={cls} onClick={() => { if (!puzzle[i]) { sfx.tap(); setSel(i) } }} aria-label={v ? symbols[v - 1] : 'empty'}>
              {v ? symbols[v - 1] : ''}
            </button>
          )
        })}
      </div>
      <div className="palette" aria-label="Pick a symbol">
        {symbols.map((s, i) => (
          <button key={s} onClick={() => put(i + 1)} aria-label={s}>{s}</button>
        ))}
        <button onClick={() => put(0)} aria-label="Erase">⌫</button>
      </div>
    </>
  )
}
