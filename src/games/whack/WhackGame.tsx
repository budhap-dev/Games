import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { sfx } from '@/shared/audio'

const CONFIG = { easy: { upMs: 1500, gapMs: 700, max: 1 }, normal: { upMs: 1000, gapMs: 450, max: 2 }, hard: { upMs: 700, gapMs: 300, max: 3 } }
const ROUND_MS = 30000
const HOLES = 9

export default function WhackGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const [up, setUp] = useState<Set<number>>(new Set())
  const [hit, setHit] = useState<Set<number>>(new Set())
  const [score, setScore] = useState(0)
  const [left, setLeft] = useState(ROUND_MS)
  const ended = useRef(false)

  // countdown timer
  useEffect(() => {
    if (paused || ended.current) return
    const t = setInterval(() => setLeft((l) => Math.max(0, l - 250)), 250)
    return () => clearInterval(t)
  }, [paused])

  // end of round
  useEffect(() => {
    if (left > 0 || ended.current) return
    ended.current = true
    setUp(new Set())
    setTimeout(() => onEnd({ score, won: score >= 10, message: score >= 20 ? `Wow! ${score} moles!` : score >= 10 ? `Nice whacking! ${score} moles` : `${score} moles — they’re quick!`, emoji: '🐹' }), 400)
  }, [left, score, onEnd])

  // mole spawner
  const upRef = useRef(up); upRef.current = up
  useEffect(() => {
    if (paused || ended.current) return
    const timers: number[] = []
    const hideT: Record<number, number> = {}
    const spawn = () => {
      const cur = upRef.current
      if (cur.size < cfg.max) {
        const free = Array.from({ length: HOLES }, (_, i) => i).filter((i) => !cur.has(i))
        const h = free[Math.floor(Math.random() * free.length)]
        setUp((c) => (c.has(h) ? c : new Set(c).add(h)))
        clearTimeout(hideT[h])
        hideT[h] = window.setTimeout(() => setUp((c) => { const m = new Set(c); m.delete(h); return m }), cfg.upMs)
      }
      timers.push(window.setTimeout(spawn, cfg.gapMs + Math.random() * cfg.gapMs))
    }
    timers.push(window.setTimeout(spawn, 400))
    // moles that were up hide on pause (their hide timers are cleared), so none get stuck after resuming
    return () => { timers.forEach(clearTimeout); Object.values(hideT).forEach(clearTimeout); setUp(new Set()) }
  }, [paused, cfg])

  const whack = (i: number) => {
    if (paused || ended.current || !up.has(i) || hit.has(i)) return
    sfx.pop()
    const s = score + 1
    setScore(s); onScore(s)
    setHit((h) => new Set(h).add(i))
    setTimeout(() => {
      setUp((c) => { const m = new Set(c); m.delete(i); return m })
      setHit((h) => { const m = new Set(h); m.delete(i); return m })
    }, 180)
  }

  return (
    <>
      <div className="row" style={{ width: 'min(100%, calc(62 * var(--vh)), 480px)', justifyContent: 'space-between' }}>
        <div className="turn">⏱ {Math.ceil(left / 1000)}s</div>
        <div className="turn">🐹 {score}</div>
      </div>
      <div className="timer-bar" aria-hidden="true"><div style={{ width: `${(left / ROUND_MS) * 100}%` }} /></div>
      <div className="mole-grid">
        {Array.from({ length: HOLES }, (_, i) => (
          <button key={i} className={`hole ${up.has(i) ? 'up' : ''} ${hit.has(i) ? 'hit' : ''}`} onPointerDown={() => whack(i)} aria-label={up.has(i) ? 'Mole! Tap it' : 'Empty hole'}>
            <span className="mole" aria-hidden="true">{hit.has(i) ? '😵' : '🐹'}</span>
          </button>
        ))}
      </div>
    </>
  )
}
