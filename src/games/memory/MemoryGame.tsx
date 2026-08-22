import { useEffect, useMemo, useState } from 'react'
import type { GameProps } from '../types'
import { sfx } from '@/shared/audio'

const EMOJI = ['🐶', '🐱', '🐸', '🦊', '🐼', '🦁', '🐵', '🐰', '🦄', '🐙', '🐢', '🦋']
const CONFIG = { easy: { pairs: 6, cols: 4 }, normal: { pairs: 8, cols: 4 }, hard: { pairs: 10, cols: 5 } }

function shuffle<T>(a: T[]) {
  const r = a.slice()
  for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] }
  return r
}

export default function MemoryGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const cfg = CONFIG[difficulty]
  const cards = useMemo(() => shuffle(shuffle(EMOJI).slice(0, cfg.pairs).flatMap((e) => [e, e])), [cfg.pairs])
  const [open, setOpen] = useState<number[]>([])
  const [matched, setMatched] = useState<Set<number>>(new Set())
  const [flips, setFlips] = useState(0)
  const [lock, setLock] = useState(false)

  useEffect(() => {
    if (open.length !== 2) return
    const [a, b] = open
    setLock(true)
    const t = setTimeout(() => {
      if (cards[a] === cards[b]) {
        const m = new Set(matched); m.add(a); m.add(b)
        setMatched(m); sfx.good()
        onScore(m.size / 2)
        if (m.size === cards.length) {
          setTimeout(() => onEnd({ score: m.size / 2, won: true, message: `All pairs in ${flips} flips!`, emoji: '🦊' }), 500)
        }
      }
      setOpen([]); setLock(false)
    }, cards[a] === cards[b] ? 350 : 800)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const flip = (i: number) => {
    if (lock || paused || open.includes(i) || matched.has(i)) return
    sfx.flip()
    setFlips((f) => f + 1)
    setOpen((o) => [...o, i])
  }

  return (
    <>
      <div className="turn">🔄 {flips} flips</div>
      <div className="board" style={{ gridTemplateColumns: `repeat(${cfg.cols}, 1fr)`, width: cfg.cols === 5 ? 'min(100%, 75vh, 560px)' : undefined }}>
        {cards.map((e, i) => {
          const up = open.includes(i) || matched.has(i)
          return (
            <button key={i} className={`mem-card ${up ? 'flipped' : ''} ${matched.has(i) ? 'matched' : ''}`} onClick={() => flip(i)} aria-label={up ? e : 'Hidden card'}>
              <div className="inner">
                <div className="face front">?</div>
                <div className="face back">{e}</div>
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
