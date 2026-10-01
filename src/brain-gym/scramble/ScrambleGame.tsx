import { useEffect, useState } from 'react'
import type { GameProps, GameStep } from '@/games/types'
import { pickWords, scramble } from './logic'
import { sfx } from '@/shared/audio'

const ROUNDS = 8

export default function ScrambleGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const [words] = useState(() => pickWords(difficulty, ROUNDS))
  const [i, setI] = useState(0)
  const [letters, setLetters] = useState(() => scramble(words[0].word))
  const [used, setUsed] = useState<number[]>([]) // tile indices, in answer order
  const [tries, setTries] = useState(0)
  const [status, setStatus] = useState<'play' | 'right' | 'wrong' | 'reveal'>('play')
  const [score, setScore] = useState(0)
  const [hist, setHist] = useState<GameStep[]>([])
  const { word, emoji } = words[i]

  const next = (s: number, h: GameStep[]) => {
    if (i + 1 >= ROUNDS) {
      onEnd({ score: s, won: s >= 6, message: s === ROUNDS ? 'Every word! Word wizard!' : s >= 6 ? `Great! ${s} out of ${ROUNDS} words` : `${s} out of ${ROUNDS} — keep spelling!`, emoji: s >= 6 ? '🧙' : '🔠', steps: h, stepsTitle: 'Your words' })
      return
    }
    setI(i + 1); setLetters(scramble(words[i + 1].word)); setUsed([]); setTries(0); setStatus('play')
  }
  const check = (u: number[]) => {
    const spelled = u.map((k) => letters[k]).join('')
    const move = `${word.toUpperCase()} ${emoji}`
    if (spelled === word) {
      const s = score + 1, h = [...hist, { move, result: tries ? '✓ 2nd try' : '✓ first try', ok: true }]
      sfx.good(); setScore(s); onScore(s); setStatus('right'); setHist(h)
      setTimeout(() => next(s, h), 900)
    } else if (tries + 1 >= 2) {
      const h = [...hist, { move, result: `you: ${spelled.toUpperCase()}`, ok: false }]
      sfx.bad(); setStatus('reveal'); setHist(h)
      setTimeout(() => next(score, h), 1800)
    } else {
      sfx.bad(); setTries(tries + 1); setStatus('wrong')
      setTimeout(() => { setUsed([]); setStatus('play') }, 700)
    }
  }
  const add = (k: number) => {
    if (paused || status !== 'play' || used.includes(k)) return
    sfx.tap()
    const u = [...used, k]
    setUsed(u)
    if (u.length === word.length) check(u)
  }
  const remove = (j: number) => {
    if (paused || status !== 'play') return
    sfx.flip(); setUsed(used.filter((_, n) => n !== j))
  }
  const reshuffle = () => {
    if (paused || status !== 'play') return
    sfx.tap(); setLetters(scramble(word)); setUsed([])
  }

  // Keyboard: type the letters, Backspace to undo
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') { if (used.length) remove(used.length - 1); return }
      const ch = e.key.toLowerCase()
      const k = letters.findIndex((l, n) => l === ch && !used.includes(n))
      if (k >= 0) add(k)
    }
    window.addEventListener('keydown', key)
    return () => window.removeEventListener('keydown', key)
  })

  const shown = status === 'reveal' ? word.split('') : used.map((k) => letters[k])
  return (
    <>
      <div className="turn">Word {i + 1} / {ROUNDS} · 🔠 {score}</div>
      <div className="scramble-pic" aria-hidden="true">{emoji}</div>
      <div className={`scramble-slots ${status}`} aria-live="polite" aria-label={`Your word: ${shown.join('') || 'empty'}`}>
        {word.split('').map((_, j) => (
          <button key={j} onClick={() => remove(j)} disabled={j >= shown.length || status !== 'play'} aria-label={shown[j] ? `Remove ${shown[j]}` : 'empty'}>{shown[j] ?? ''}</button>
        ))}
      </div>
      <div className="scramble-tiles" role="group" aria-label="Letters">
        {letters.map((l, k) => (
          <button key={k} onClick={() => add(k)} disabled={used.includes(k) || status !== 'play'} aria-label={l}>{l}</button>
        ))}
      </div>
      {status === 'reveal' ? <div className="howto">💡 It was <b>{word.toUpperCase()}</b></div>
        : <button className="btn ghost" onClick={reshuffle}>🔀 Mix again</button>}
    </>
  )
}
