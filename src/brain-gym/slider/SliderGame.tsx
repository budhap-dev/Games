import { useEffect, useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { isSolved, move, shuffle } from './logic'
import { sfx } from '@/shared/audio'

const CONFIG = { easy: { n: 3, moves: 25, numbers: true }, normal: { n: 4, moves: 60, numbers: true }, hard: { n: 4, moves: 120, numbers: false } }
const PICS = ['🦁', '🐼', '🦄', '🐙', '🦋', '🐸', '🚀', '🌈']
const GRADS = [['#ff7a1a', '#ffc93c'], ['#2d9cdb', '#7b4fd6'], ['#3fb55b', '#2d9cdb'], ['#ff5fa2', '#ff7a1a']]

/** Paint the picture once to a data URL: gradient + big emoji. */
function makePicture(emoji: string, grad: string[]): string {
  const c = document.createElement('canvas'); c.width = c.height = 600
  const ctx = c.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 600, 600); g.addColorStop(0, grad[0]); g.addColorStop(1, grad[1])
  ctx.fillStyle = g; ctx.fillRect(0, 0, 600, 600)
  ctx.fillStyle = 'rgba(255,255,255,.18)'
  for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(80 + i * 95, 80 + (i % 2) * 420, 40, 0, Math.PI * 2); ctx.fill() }
  ctx.font = '420px serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.fillText(emoji, 300, 320)
  return c.toDataURL()
}

export default function SliderGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const [tiles, setTiles] = useState(() => shuffle(cfg.n, cfg.moves))
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)
  const pic = useMemo(() => makePicture(PICS[Math.floor(Math.random() * PICS.length)], GRADS[Math.floor(Math.random() * GRADS.length)]), [])

  useEffect(() => {
    if (done || !isSolved(tiles)) return
    setDone(true); sfx.win(); onScore(1)
    setTimeout(() => onEnd({ score: 1, won: true, message: `Picture fixed in ${moves} moves!`, emoji: '🧩' }), 700)
  }, [tiles, done, moves, onScore, onEnd])

  const tap = (i: number) => {
    if (paused || done) return
    const nt = move(tiles, i, cfg.n)
    if (!nt) { sfx.tap(); return }
    sfx.flip(); setTiles(nt); setMoves((m) => m + 1)
  }

  const n = cfg.n
  return (
    <>
      <div className="turn">👣 {moves} moves</div>
      <div className={`slider ${done ? 'solved' : ''}`} style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label="Sliding puzzle">
        {tiles.map((v, i) => {
          const src = done ? i : v - 1 // when solved, show the full picture including the blank's piece
          const r = Math.floor(src / n), c = src % n
          return (
            <button
              key={i}
              className={v === 0 && !done ? 'blank' : ''}
              onClick={() => tap(i)}
              aria-label={v === 0 ? 'Empty space' : `Tile ${v}`}
              style={{ backgroundImage: `url(${pic})`, backgroundSize: `${n * 100}% ${n * 100}%`, backgroundPosition: `${(c / (n - 1)) * 100}% ${(r / (n - 1)) * 100}%` }}
            >
              {cfg.numbers && v !== 0 && !done ? v : ''}
            </button>
          )
        })}
      </div>
    </>
  )
}
