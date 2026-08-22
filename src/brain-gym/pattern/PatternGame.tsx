import { useState } from 'react'
import type { GameProps } from '@/games/types'
import { makeRound } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 8

export default function PatternGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [round, setRound] = useState(() => makeRound(difficulty))
  const [i, setI] = useState(1)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const choose = (opt: string) => {
    if (picked || paused) return
    setPicked(opt)
    const ok = opt === round.answer
    const s = score + (ok ? 1 : 0)
    if (ok) { sfx.good(); setScore(s); onScore(s) } else sfx.bad()
    setTimeout(() => {
      if (i >= ROUNDS) {
        onEnd({ score: s, won: s >= 6, message: s === ROUNDS ? 'Perfect! All 8 right!' : s >= 6 ? `Great! ${s} out of 8` : `${s} out of 8 — keep practising!`, emoji: s >= 6 ? '🏅' : '🔺' })
      } else { setI(i + 1); setRound(makeRound(difficulty)); setPicked(null) }
    }, ok ? 700 : 1100)
  }

  return (
    <>
      <div className="turn">Round {i} / {ROUNDS}</div>
      <div className="card stack" style={{ width: 'min(100%, 560px)' }}>
        <div className="seq" aria-label="Pattern">
          {round.seq.map((s, k) => <div key={k} className="item">{s}</div>)}
          <div className="item q" aria-label="What comes next?">?</div>
        </div>
        <p className="center muted" style={{ margin: 0 }}>What comes next?</p>
        <div className="opts">
          {round.options.map((o) => (
            <button key={o} onClick={() => choose(o)} className={picked ? (o === round.answer ? 'right' : o === picked ? 'wrong' : '') : ''} aria-label={`Answer ${o}`}>{o}</button>
          ))}
        </div>
      </div>
    </>
  )
}
