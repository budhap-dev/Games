import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore, useTodaySeconds } from '@/shared/store'

const HOLD_MS = 2000

export function GrownUps() {
  const [open, setOpen] = useState(false)
  if (!open) return <Gate onOpen={() => setOpen(true)} />
  return <Settings />
}

function Gate({ onOpen }: { onOpen: () => void }) {
  const [pct, setPct] = useState(0)
  const timer = useRef<number>(0)
  const startAt = useRef(0)
  const stop = () => { cancelAnimationFrame(timer.current); setPct(0) }
  const tick = () => {
    const p = Math.min(1, (performance.now() - startAt.current) / HOLD_MS)
    setPct(p)
    if (p >= 1) onOpen(); else timer.current = requestAnimationFrame(tick)
  }
  const start = () => { startAt.current = performance.now(); timer.current = requestAnimationFrame(tick) }
  useEffect(() => () => cancelAnimationFrame(timer.current), [])
  return (
    <>
      <header className="topbar">
        <Link className="btn icon" to="/" aria-label="Back">🏠</Link>
        <h1 style={{ fontSize: '1.6rem' }}>🔒 Grown-ups corner</h1>
      </header>
      <main className="page">
        <div className="card start-card stack center">
          <p className="muted">Ask a grown-up! Press and hold the button for 2 seconds to open settings.</p>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              className="hold"
              onPointerDown={start}
              onPointerUp={stop}
              onPointerLeave={stop}
              onPointerCancel={stop}
              onContextMenu={(e) => e.preventDefault()}
              aria-label="Press and hold to open"
            >
              <div className="fill" style={{ height: `${pct * 100}%` }} />
              <span>Hold me</span>
            </button>
          </div>
        </div>
      </main>
    </>
  )
}

function Settings() {
  const s = useStore()
  const today = useTodaySeconds()
  const [confirm, setConfirm] = useState(false)
  const mins = Math.round(today / 60)
  return (
    <>
      <header className="topbar">
        <Link className="btn icon" to="/" aria-label="Back">🏠</Link>
        <h1 style={{ fontSize: '1.6rem' }}>🔒 Grown-ups corner</h1>
      </header>
      <main className="page">
        <div className="card start-card">
          <div className="setting">
            <div><b>Played today</b><div className="muted">{mins} min</div></div>
          </div>
          <div className="setting">
            <div><b>Daily play limit</b><div className="muted">Games pause when the limit is reached</div></div>
            <select value={s.dailyLimitMin} onChange={(e) => s.setDailyLimit(Number(e.target.value))} style={{ font: 'inherit', padding: '8px 12px', borderRadius: 12 }}>
              <option value={0}>No limit</option>
              <option value={15}>15 min</option>
              <option value={30}>30 min</option>
              <option value={45}>45 min</option>
              <option value={60}>60 min</option>
              <option value={90}>90 min</option>
            </select>
          </div>
          <div className="setting">
            <div><b>Sounds</b><div className="muted">Pops, cheers and jingles</div></div>
            <button className="switch" role="switch" aria-checked={s.sound} onClick={() => s.setSound(!s.sound)} aria-label="Sounds" />
          </div>
          <div className="setting">
            <div><b>Less motion</b><div className="muted">Turn off confetti and big animations</div></div>
            <button className="switch" role="switch" aria-checked={s.reducedMotion} onClick={() => s.setReducedMotion(!s.reducedMotion)} aria-label="Less motion" />
          </div>
          <div className="setting">
            <div><b>Reset progress</b><div className="muted">Clears scores and stickers on this device</div></div>
            {confirm ? (
              <div className="row">
                <button className="btn" onClick={() => { s.resetAll(); setConfirm(false) }}>Yes, reset</button>
                <button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button>
              </div>
            ) : (
              <button className="btn" onClick={() => setConfirm(true)}>Reset…</button>
            )}
          </div>
          <p className="muted" style={{ fontSize: '.9rem', marginTop: 16 }}>
            PlayPatch has no ads, no accounts and no chat. Everything stays on this device.
          </p>
        </div>
      </main>
    </>
  )
}
