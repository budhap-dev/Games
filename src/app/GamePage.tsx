import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { getGame } from '@/games/registry'
import type { GameEnd } from '@/games/types'
import { useStore, useTodaySeconds } from '@/shared/store'
import type { Difficulty } from '@/shared/store'
import { awardStickers } from '@/shared/stickers'
import type { Sticker } from '@/shared/stickers'
import { sfx } from '@/shared/audio'
import { Confetti } from '@/shared/Confetti'
import { Icon } from '@/shared/Icon'

const CATEGORY = { arcade: 'Arcade', brain: 'Brain Gym', teen: 'Brain Lab' } as const

type Phase = 'start' | 'playing' | 'paused' | 'ended'

export function GamePage() {
  const { id = '' } = useParams()
  const [params] = useSearchParams()
  const game = getGame(id)
  const nav = useNavigate()
  const store = useStore()
  const [copied, setCopied] = useState(false)
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
  const autoStart = useRef(params.get('start') === '1')
  useEffect(() => {
    const d = params.get('d') as Difficulty | null
    if (d && ['easy', 'normal', 'hard'].includes(d) && store.difficulty[id] !== d) store.setDifficulty(id, d)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  useEffect(() => { window.scrollTo(0, 0) }, [])

  // Remember the open game so reopening the app comes back here; leaving it in-app (🏠, back) forgets it.
  useEffect(() => {
    if (!game?.ready) return
    useStore.getState().setLastGame(game.id)
    return () => useStore.getState().setLastGame(null)
  }, [game])

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

  const shareLink = async () => {
    const url = `${location.origin}/play/${game!.id}?d=${difficulty}&start=1`
    sfx.tap()
    try { if (navigator.share && navigator.maxTouchPoints > 0) { await navigator.share({ title: `PlayPatch — ${game!.name}`, url }); return } } catch (e) { if ((e as Error).name === 'AbortError') return }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked */ }
  }
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

  // ?start=1 → skip the start card (used by shared links and home-screen shortcuts)
  useEffect(() => {
    if (autoStart.current && game?.ready && Game && !overLimit && phase === 'start') { autoStart.current = false; start() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [game, Game])

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
    <div className="game-shell" style={{ '--c': `var(--${game.color})` } as CSSProperties}>
      <Confetti burst={burst} />
      <div className="game-top">
        <button className="btn icon ghost" aria-label="Back to games" onClick={() => nav('/')}><Icon name="back" /></button>
        <h1><span className="game-ico" aria-hidden="true">{game.emoji}</span><span className="game-name">{game.name}</span></h1>
        {phase !== 'start' && <div className="score-pill" aria-live="polite"><span key={score} className="bump">{score}</span> <small>{game.scoreLabel}</small></div>}
        {phase === 'playing' && <button className="btn icon" aria-label="Pause" onClick={() => { sfx.tap(); setPhase('paused') }}><Icon name="pause" /></button>}
      </div>

      {phase === 'start' ? (
        <div className="card start-card stack">
          <div className="start-hero" aria-hidden="true"><span className="hero-emoji">{game.emoji}</span></div>
          <div className="start-title">
            <h2>{game.name}</h2>
            <p className="muted">{CATEGORY[game.category]}{store.best[game.id] ? ` · Best ${store.best[game.id]} ${game.scoreLabel}` : ''}</p>
          </div>
          <div className="howto with-ico"><Icon name="info" size={20} /><span>{game.howTo}</span></div>
          <div className="seg" role="group" aria-label="Difficulty">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((d) => (
              <button key={d} aria-pressed={difficulty === d} onClick={() => { sfx.tap(); store.setDifficulty(game.id, d) }}>
                {d === 'easy' ? 'Easy' : d === 'normal' ? 'Normal' : 'Hard'}
              </button>
            ))}
          </div>
          {overLimit ? (
            <div className="howto center" style={{ background: 'var(--sun-soft)' }}>⏰ Play time is over for today. Time for a break!</div>
          ) : (
            <button className="btn primary" onClick={start}><Icon name="play" /> Play</button>
          )}
          <div className="row" style={{ justifyContent: 'center' }}>
            <button className={`btn ${store.favs.includes(game.id) ? 'on' : ''}`} aria-pressed={store.favs.includes(game.id)} onClick={() => { sfx.tap(); store.toggleFav(game.id) }}><Icon name={store.favs.includes(game.id) ? 'heartFill' : 'heart'} size={20} />{store.favs.includes(game.id) ? 'Favourite' : 'Add to favourites'}</button>
            <button className="btn ghost" onClick={shareLink}><Icon name={copied ? 'check' : 'link'} size={20} />{copied ? 'Link copied' : 'Share link'}</button>
          </div>
        </div>
      ) : (
        <div className="game-area">
          <Suspense fallback={<div className="card">Loading…</div>}>
            <Game key={run} difficulty={difficulty} paused={phase !== 'playing'} onScore={setScore} onEnd={onEnd} />
          </Suspense>

          {phase === 'paused' && (
            <div className="overlay">
              <div className="card stack">
                <div className="big">{overLimit ? '⏰' : <span className="big-ico"><Icon name="pause" size={34} /></span>}</div>
                <h2>{overLimit ? 'Time for a break!' : 'Paused'}</h2>
                {overLimit ? <p className="muted">Play time is over for today.</p> : <button className="btn primary" onClick={() => { sfx.tap(); setPhase('playing') }}><Icon name="play" /> Keep playing</button>}
                <button className="btn" onClick={start}><Icon name="refresh" size={20} /> Restart</button>
                <Link className="btn ghost" to="/"><Icon name="grid" size={20} /> All games</Link>
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
                  {isBest && end.score > 0 ? <> <span className="badge">🏅 New best</span></> : null}
                </p>
                {end.details?.map((d, i) => <p key={i} className="muted" style={{ margin: 0, fontSize: '1rem' }}>{d}</p>)}
                {end.list?.length ? (
                  <ul className="end-list" aria-label="Breakdown">
                    {end.list.map((it, i) => <li key={i} className={it.ok === false ? 'bad' : ''}><span>{it.label}</span><b>{it.value}</b></li>)}
                  </ul>
                ) : null}
                {end.steps?.length ? (
                  <details className="end-steps" open>
                    <summary>{end.stepsTitle ?? 'Your steps'} <small>{end.steps.length}</small></summary>
                    <ol>
                      {end.steps.map((st, i) => (
                        <li key={i} className={st.ok === true ? 'ok' : st.ok === false ? 'bad' : ''} data-who={st.who} style={{ '--i': Math.min(i, 14) } as CSSProperties}>
                          <span className="n">{i + 1}</span>
                          {st.who && <span className="who">{st.who}</span>}
                          <span className="mv">{st.move}</span>
                          {st.result && <span className="res">{st.result}</span>}
                        </li>
                      ))}
                    </ol>
                  </details>
                ) : null}
                {newStickers.map((s) => (
                  <div key={s.id} className="howto" style={{ background: 'var(--sun-soft)' }}>
                    🎁 New sticker: <b>{s.emoji} {s.name}</b>
                  </div>
                ))}
                <button className="btn primary" onClick={start}><Icon name="refresh" /> Play again</button>
                <Link className="btn ghost" to="/"><Icon name="grid" size={20} /> All games</Link>
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
