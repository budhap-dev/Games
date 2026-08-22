import { useEffect, useState } from 'react'
import type { GameProps } from '@/games/types'
import { makeQuestion } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 10
const PER_Q_MS = 10000

export default function QuickMathsGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const timed = difficulty !== 'easy'
  const [q, setQ] = useState(() => makeQuestion(difficulty))
  const [i, setI] = useState(1)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [left, setLeft] = useState(PER_Q_MS)

  const next = (s: number) => {
    if (i >= ROUNDS) onEnd({ score: s, won: s >= 8, message: s === ROUNDS ? 'Perfect 10!' : s >= 8 ? `Brilliant! ${s} out of 10` : `${s} out of 10 — good practice!`, emoji: s >= 8 ? '🏅' : '➕' })
    else { setI(i + 1); setQ(makeQuestion(difficulty)); setPicked(null); setLeft(PER_Q_MS) }
  }
  const choose = (opt: number | null) => {
    if (picked !== null || paused) return
    setPicked(opt ?? -1)
    const ok = opt === q.answer
    const s = score + (ok ? 1 : 0)
    if (ok) { sfx.good(); setScore(s); onScore(s) } else sfx.bad()
    setTimeout(() => next(s), ok ? 600 : 1200)
  }

  useEffect(() => {
    if (!timed || paused || picked !== null) return
    const t = setInterval(() => setLeft((l) => {
      if (l <= 250) { clearInterval(t); choose(null); return 0 }
      return l - 250
    }), 250)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timed, paused, picked, i])

  return (
    <>
      <div className="turn">Question {i} / {ROUNDS} · ✅ {score}</div>
      {timed && <div className="timer-bar" aria-label="Time left"><div style={{ width: `${(left / PER_Q_MS) * 100}%`, background: left < 3000 ? 'var(--pink)' : 'var(--lime)' }} /></div>}
      <div className="card stack" style={{ width: 'min(100%, 480px)' }}>
        <div className="sum" aria-live="polite">{q.text}</div>
        <div className="answers">
          {q.options.map((o) => (
            <button key={o} onClick={() => choose(o)} className={picked !== null ? (o === q.answer ? 'right' : o === picked ? 'wrong' : '') : ''} aria-label={`Answer ${o}`}>{o}</button>
          ))}
        </div>
      </div>
    </>
  )
}
