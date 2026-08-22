import { useState } from 'react'
import type { GameProps } from '@/games/types'
import { isOff, press, scramble } from './logic'
import { sfx } from '@/shared/audio'

const CONFIG = { easy: { n: 3, k: 3 }, normal: { n: 5, k: 5 }, hard: { n: 5, k: 12 } }

export default function LightsOutGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const [lights, setLights] = useState(() => scramble(cfg.n, cfg.k))
  const [moves, setMoves] = useState(0)
  const [done, setDone] = useState(false)

  const tap = (i: number) => {
    if (paused || done) return
    const l = press(lights, cfg.n, i)
    setLights(l); setMoves(moves + 1); sfx.flip()
    if (isOff(l)) {
      setDone(true); sfx.win(); onScore(1)
      setTimeout(() => onEnd({ score: 1, won: true, message: `All lights out in ${moves + 1} moves!`, emoji: '💡' }), 600)
    }
  }
  return (
    <>
      <div className="turn">💡 {lights.filter(Boolean).length} on · {moves} moves</div>
      <div className="lights" style={{ gridTemplateColumns: `repeat(${cfg.n}, 1fr)` }} role="grid" aria-label="Lights grid">
        {lights.map((on, i) => <button key={i} className={on ? 'on' : ''} onClick={() => tap(i)} aria-label={on ? 'light on' : 'light off'} aria-pressed={on} />)}
      </div>
    </>
  )
}
