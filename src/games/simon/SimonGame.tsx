import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '../types'
import { sfx } from '@/shared/audio'

const PADS = [
  { col: '#ff5fa2', emoji: '🍓' }, { col: '#2d9cdb', emoji: '🫐' }, { col: '#ffc93c', emoji: '🍋' },
  { col: '#3fb55b', emoji: '🍏' }, { col: '#7b4fd6', emoji: '🍇' }, { col: '#ff7a1a', emoji: '🍊' },
]
const CONFIG = { easy: { pads: 4, onMs: 600, offMs: 250 }, normal: { pads: 4, onMs: 420, offMs: 180 }, hard: { pads: 6, onMs: 320, offMs: 140 } }

export default function SimonGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const [seq, setSeq] = useState<number[]>([])
  const [lit, setLit] = useState<number | null>(null)
  const [phase, setPhase] = useState<'show' | 'input' | 'done'>('show')
  const [pos, setPos] = useState(0)
  const timers = useRef<number[]>([])
  const pausedRef = useRef(paused); pausedRef.current = paused

  // start / extend sequence and play it back
  useEffect(() => {
    if (phase !== 'show' || paused) return
    const next = [...seq, Math.floor(Math.random() * cfg.pads)]
    setSeq(next); setPos(0)
    let t = 500
    next.forEach((p) => {
      timers.current.push(window.setTimeout(() => { setLit(p); sfx.note(p) }, t))
      timers.current.push(window.setTimeout(() => setLit(null), t + cfg.onMs))
      t += cfg.onMs + cfg.offMs
    })
    timers.current.push(window.setTimeout(() => setPhase('input'), t + 100))
    return () => { timers.current.forEach(clearTimeout); timers.current = [] }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, paused])

  const press = (p: number) => {
    if (phase !== 'input' || paused) return
    setLit(p); sfx.note(p)
    window.setTimeout(() => setLit(null), 200)
    if (p === seq[pos]) {
      if (pos + 1 === seq.length) {
        const rounds = seq.length
        onScore(rounds); setPhase('done')
        window.setTimeout(() => setPhase('show'), 700)
      } else setPos(pos + 1)
    } else {
      setPhase('done'); sfx.bad()
      const rounds = seq.length - 1
      window.setTimeout(() => onEnd({ score: rounds, won: rounds >= 5, message: rounds === 0 ? 'Oops! Listen closely and try again' : rounds >= 8 ? `Amazing memory! ${rounds} rounds` : `${rounds} rounds — great listening!`, emoji: '🎵' }), 500)
    }
  }

  const cols = cfg.pads === 6 ? 3 : 2
  return (
    <>
      <div className="turn" aria-live="polite">
        {phase === 'show' ? '👀 Watch…' : phase === 'input' ? `👆 Your turn · ${pos} / ${seq.length}` : '✨'} · Round {seq.length}
      </div>
      <div className="simon" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {PADS.slice(0, cfg.pads).map((p, i) => (
          <button key={i} className={lit === i ? 'lit' : ''} style={{ background: p.col }} disabled={phase !== 'input' || paused} onPointerDown={() => press(i)} aria-label={`Pad ${i + 1}`}>{p.emoji}</button>
        ))}
      </div>
    </>
  )
}
