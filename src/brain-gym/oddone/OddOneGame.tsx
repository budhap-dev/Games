import { useState } from 'react'
import type { GameProps } from '@/games/types'
import { makeOddRound } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 8
const COLS = { easy: 2, normal: 3, hard: 4 }

export default function OddOneGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [round, setRound] = useState(() => makeOddRound(difficulty))
  const [i, setI] = useState(1)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)

  const choose = (item: string) => {
    if (picked || paused) return
    setPicked(item)
    const ok = item === round.odd
    const s = score + (ok ? 1 : 0)
    if (ok) { sfx.good(); setScore(s); onScore(s) } else sfx.bad()
    setTimeout(() => {
      if (i >= ROUNDS) onEnd({ score: s, won: s >= 6, message: s === ROUNDS ? 'Perfect! Sharp eyes!' : s >= 6 ? `Great! ${s} out of 8` : `${s} out of 8 — keep looking!`, emoji: s >= 6 ? '🦆' : '👀' })
      else { setI(i + 1); setRound(makeOddRound(difficulty)); setPicked(null) }
    }, ok ? 700 : 1100)
  }

  return (
    <>
      <div className="turn">Round {i} / {ROUNDS} · 🦆 {score}</div>
      <p className="muted center" style={{ margin: 0 }}>Which one doesn’t belong?</p>
      <div className="odd-grid" style={{ gridTemplateColumns: `repeat(${COLS[difficulty]}, 1fr)` }}>
        {round.items.map((it, k) => (
          <button key={k} onClick={() => choose(it)} className={picked ? (it === round.odd ? 'right' : it === picked ? 'wrong' : '') : ''} aria-label={it}>{it}</button>
        ))}
      </div>
      {picked && <div className="howto">{picked === round.odd ? '✅' : '💡'} {round.hint}</div>}
    </>
  )
}
