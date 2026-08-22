import { useCallback, useEffect, useRef, useState } from 'react'
import type { GameProps } from '@/games/types'
import { addRandom, canMove, empty, maxTile, slide } from './logic'
import type { Grid } from './logic'
import { useDirectionInput } from '@/shared/useInput'
import type { Dir } from '@/shared/useInput'
import { sfx } from '@/shared/audio'

const SIZE = { easy: 5, normal: 4, hard: 3 }

export default function Game2048({ difficulty, paused, onScore, onEnd }: GameProps) {
  const n = SIZE[difficulty]
  const [grid, setGrid] = useState<Grid>(() => addRandom(addRandom(empty(n))))
  const [score, setScore] = useState(0)
  const [lastNew, setLastNew] = useState<string>('')
  const reached = useRef(false)
  const ended = useRef(false)
  const gridRef = useRef(grid); gridRef.current = grid
  const scoreRef = useRef(score); scoreRef.current = score

  const move = useCallback((d: Dir) => {
    if (paused || ended.current) return
    const r = slide(gridRef.current, d)
    if (!r.moved) return
    const before = r.grid.map((row) => row.slice())
    const next = addRandom(r.grid)
    // find the new tile for a pop animation
    outer: for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (before[i][j] !== next[i][j]) { setLastNew(`${i},${j}`); break outer }
    const s = scoreRef.current + r.gained
    setGrid(next); setScore(s); onScore(s)
    r.gained ? sfx.pop() : sfx.flip()
    if (!reached.current && maxTile(next) >= 2048) { reached.current = true; sfx.win() }
    if (!canMove(next)) {
      ended.current = true
      setTimeout(() => onEnd({ score: s, won: maxTile(next) >= 2048, message: maxTile(next) >= 2048 ? `2048! Final score ${s}` : `No moves left — best tile ${maxTile(next)}`, emoji: maxTile(next) >= 2048 ? '🏆' : '🔢' }), 600)
    }
  }, [paused, n, onScore, onEnd])
  useDirectionInput(move, !paused)

  useEffect(() => { if (!paused && !ended.current && !canMove(gridRef.current)) ended.current = true }, [paused])

  return (
    <>
      <div className="turn">🔢 {score} · best tile {maxTile(grid)}</div>
      <div className="g2048" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label="2048 board">
        {grid.flatMap((row, i) => row.map((v, j) => (
          <div key={`${i},${j}`} className={`t ${v ? (v > 2048 ? 'big' : `v${v}`) : ''} ${lastNew === `${i},${j}` ? 'new' : ''}`} aria-label={v ? String(v) : 'empty'}>{v || ''}</div>
        )))}
      </div>
      <p className="muted center" style={{ margin: 0, fontSize: '.95rem' }}>Swipe anywhere or use arrow keys</p>
    </>
  )
}
