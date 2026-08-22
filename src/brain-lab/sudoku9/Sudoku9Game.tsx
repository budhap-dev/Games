import { useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { conflicts, generate, isSolved } from '@/brain-gym/sudoku/logic'
import { sfx } from '@/shared/audio'

const SHAPE = { n: 9, boxR: 3, boxC: 3 }
const HOLES = { easy: 38, normal: 48, hard: 55 }

export default function Sudoku9Game({ difficulty, paused, onScore, onEnd }: GameProps) {
  const { puzzle } = useMemo(() => generate(SHAPE, HOLES[difficulty]), [difficulty])
  const [grid, setGrid] = useState(puzzle)
  const [sel, setSel] = useState<number | null>(null)
  const [done, setDone] = useState(false)
  const bad = useMemo(() => conflicts(grid, SHAPE), [grid])
  const selVal = sel === null ? 0 : grid[sel]

  const put = (v: number) => {
    if (sel === null || puzzle[sel] || done || paused) return
    const g = grid.slice(); g[sel] = v; setGrid(g); sfx.tap()
    if (isSolved(g, SHAPE)) { setDone(true); sfx.win(); onScore(1); setTimeout(() => onEnd({ score: 1, won: true, message: 'Sudoku solved!', emoji: '9️⃣' }), 500) }
  }
  const counts = Array.from({ length: 9 }, (_, i) => grid.filter((v) => v === i + 1).length)
  return (
    <>
      <div className="turn">9️⃣ {grid.filter(Boolean).length} / 81</div>
      <div className="sudoku" style={{ gridTemplateColumns: 'repeat(9, 1fr)', gap: 2, padding: 3 }} role="grid" aria-label="Sudoku 9x9">
        {grid.map((v, i) => {
          const r = Math.floor(i / 9), c = i % 9
          const cls = [puzzle[i] ? 'given' : '', sel === i ? 'sel' : '', bad.has(i) ? 'bad' : '', (r + 1) % 3 === 0 && r < 8 ? 'box-r' : '', (c + 1) % 3 === 0 && c < 8 ? 'box-c' : ''].join(' ')
          return (
            <button key={i} className={cls} style={{ fontSize: 'clamp(.9rem, 4vw, 1.4rem)', outline: selVal && v === selVal && sel !== i ? '3px solid var(--sky)' : undefined, outlineOffset: -3 }} onClick={() => { sfx.tap(); setSel(i) }} aria-label={v ? String(v) : 'empty'}>
              {v || ''}
            </button>
          )
        })}
      </div>
      <div className="palette" aria-label="Numbers">
        {Array.from({ length: 9 }, (_, i) => <button key={i} onClick={() => put(i + 1)} disabled={counts[i] >= 9} style={{ width: 44, height: 48, fontSize: '1.2rem', opacity: counts[i] >= 9 ? 0.35 : 1 }} aria-label={String(i + 1)}>{i + 1}</button>)}
        <button onClick={() => put(0)} style={{ width: 44, height: 48 }} aria-label="Erase">⌫</button>
      </div>
    </>
  )
}
