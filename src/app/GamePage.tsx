import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getGame } from '@/games/registry'
import type { GameEnd } from '@/games/types'
import { useStore, useTodaySeconds } from '@/shared/store'
import type { Difficulty } from '@/shared/store'
import { awardStickers } from '@/shared/stickers'
import type { Sticker } from '@/shared/stickers'
import { sfx } from '@/shared/audio'
import { Confetti } from '@/shared/Confetti'

type Phase = 'start' | 'playing' | 'paused' | 'ended'

export function GamePage() {
  const { id = '' } = useParams()
  const game = getGame(id)
  const nav = useNavigate()
  const store = useStore()
  const todaySec = useTodaySeconds()
  const limitSec = store.dailyLimitMin * 60
  const overLimit = limitSec > 0 && todaySec >= limitSec

  const [phase, setPhase] = useState<Phase>('start')
  const [run, setRun] = useState(0)
  const [score, setScore] = useState(0)
  const [end, setEnd] = useState<GameEnd | null>(null)
  const [isBest, setIsBest] = useState(false)
  const [newStickers, setNewStickers] = useState<Sticker[]>([])
  const [burst, setBurst] = useState(0)
  const difficulty: Difficulty = store.difficulty[id] ?? 'easy'

  const Game = useMemo(() => (game?.load ? lazy(game.load) : null), [game])

  // Track play time while playing
  const phaseRef = useRef(phase)
  phaseRef.current = phase
  useEffect(() => {
    const t = setInterval(() => { if (phaseRef.current === 'playing') store.addPlaySeconds(5) }, 5000)
    return () => clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  useEffect(() => { if (overLimit && phase === 'playing') setPhase('paused') }, [overLimit, phase])

  // Pause when tab hidden
  useEffect(() => {
    const onVis = () => { if (document.hidden && phaseRef.current === 'playing') setPhase('paused') }
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  if (!game) return <NotFound />

  const start = () => {
    sfx.unlock(); sfx.tap()
    setScore(0); setEnd(null); setNewStickers([]); setIsBest(false)
    setRun((r) => r + 1)
    setPhase('playing')
  }
  const onEnd = (r: GameEnd) => {
    setEnd(r)
    setPhase('ended')
    const { isBest } = store.recordResult({ gameId: game.id, category: game.category, score: r.score, won: r.won })
    setIsBest(isBest)
    const fresh = awardStickers()
    setNewStickers(fresh)
    if (r.won || isBest || fresh.length) { sfx.win(); setBurst((b) => b + 1) } else sfx.lose()
  }

  if (!game.ready || !Game) {
    return (
      <main className="page">
        <div className="card start-card stack center">
          <div className="hero-emoji">{game.emoji}</div>
          <h1>{game.name}</h1>
          <p className="muted">This game is still being built. Check back soon!</p>
          <Link to="/" className="btn primary">Back to games</Link>
        </div>
      </main>
    )
  }

  return (
    <div className="game-shell">
      <Confetti burst={burst} />
      <div className="game-top">
        <button className="btn icon" aria-label="Back to games" onClick={() => nav('/')}>🏠</button>
        <h1>{game.emoji} {game.name}</h1>
        {phase !== 'start' && <div className="score-pill" aria-live="polite">{score} {game.scoreLabel}</div>}
        {phase === 'playing' && <button className="btn icon" aria-label="Pause" onClick={() => { sfx.tap(); setPhase('paused') }}>⏸️</button>}
      </div>

      {phase === 'start' ? (
        <div className="card start-card stack">
          <div className="hero-emoji">{game.emoji}</div>
          <h2 className="center" style={{ fontSize: '2rem' }}>{game.name}</h2>
          <div className="howto">💡 {game.howTo}</div>
          <div className="seg" role="group" aria-label="Difficulty">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} aria-pressed={difficulty === d} onClick={() => { sfx.tap(); store.setDifficulty(game.id, d) }}>
                {d === 'easy' ? '🙂 Easy' : d === 'normal' ? '😃 Normal' : '🤩 Hard'}
              </button>
            ))}
          </div>
          {overLimit ? (
            <div className="howto center" style={{ background: 'var(--sun-soft)' }}>⏰ Play time is over for today. Time for a break!</div>
          ) : (
            <button className="btn primary" onClick={start}>▶ Play</button>
          )}
          {store.best[game.id] ? <p className="center muted">Best: {store.best[game.id]} {game.scoreLabel}</p> : null}
        </div>
      ) : (
        <div className="game-area">
          <Suspense fallback={<div className="card">Loading…</div>}>
            <Game key={run} difficulty={difficulty} paused={phase !== 'playing'} onScore={setScore} onEnd={onEnd} />
          </Suspense>

          {phase === 'paused' && (
            <div className="overlay">
              <div className="card stack">
                <div className="big">{overLimit ? '⏰' : '⏸️'}</div>
                <h2>{overLimit ? 'Time for a break!' : 'Paused'}</h2>
                {overLimit ? <p className="muted">Play time is over for today.</p> : <button className="btn primary" onClick={() => { sfx.tap(); setPhase('playing') }}>▶ Keep playing</button>}
                <button className="btn" onClick={start}>🔄 Restart</button>
                <Link className="btn ghost" to="/">🏠 All games</Link>
              </div>
            </div>
          )}

          {phase === 'ended' && end && (
            <div className="overlay">
              <div className="card stack">
                <div className="big">{end.emoji ?? (end.won ? '🎉' : '💫')}</div>
                <h2>{end.message}</h2>
                <p style={{ fontSize: '1.3rem', margin: 0 }}>
                  <b>{end.score}</b> {game.scoreLabel}
                  {isBest && end.score > 0 ? <span> · 🏅 New best!</span> : null}
                </p>
                {newStickers.map((s) => (
                  <div key={s.id} className="howto" style={{ background: 'var(--sun-soft)' }}>
                    🎁 New sticker: <b>{s.emoji} {s.name}</b>
                  </div>
                ))}
                <button className="btn primary" onClick={start}>🔄 Play again</button>
                <Link className="btn ghost" to="/">🏠 All games</Link>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function NotFound() {
  return (
    <main className="page">
      <div className="card start-card stack center">
        <div className="hero-emoji">🤔</div>
        <h1>Hmm, no game here</h1>
        <Link to="/" className="btn primary">Back to games</Link>
      </div>
    </main>
  )
}
