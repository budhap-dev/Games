import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '@/shared/store'
import { authEnabled, signInWithGoogle, signOutUser } from '@/shared/auth'
import { sfx } from '@/shared/audio'

export function Account() {
  const user = useStore((s) => s.user)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState<string | null>(null)
  const signIn = async () => { setBusy(true); setErr(null); try { sfx.tap(); await signInWithGoogle() } catch { setErr('Sign-in didn’t work — check your connection and try again.') } finally { setBusy(false) } }
  return (
    <>
      <header className="topbar">
        <Link className="btn icon" to="/" aria-label="Back">🏠</Link>
        <h1 style={{ fontSize: '1.6rem' }}>👤 Account</h1>
      </header>
      <main className="page">
        <div className="card stack" style={{ maxWidth: 560, margin: '0 auto' }}>
          {!authEnabled ? (
            <>
              <h2 style={{ fontSize: '1.3rem' }}>Playing as a guest</h2>
              <p className="muted" style={{ margin: 0 }}>Your scores, stickers and favourites are saved on this device. Sign-in isn’t set up on this site yet.</p>
            </>
          ) : user ? (
            <>
              <div className="row">{user.photo && <img src={user.photo} alt="" width={56} height={56} style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" />}<div><h2 style={{ fontSize: '1.3rem' }}>Welcome, {user.name}!</h2><p className="muted" style={{ margin: 0 }}>Your progress is saved to your Google account and synced across devices.</p></div></div>
              <button className="btn" onClick={async () => { sfx.tap(); await signOutUser() }}>Sign out</button>
              <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>Signing out keeps a copy of your progress on this device.</p>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.3rem' }}>Keep your progress</h2>
              <p className="muted" style={{ margin: 0 }}>Sign in with Google to save scores, stickers and favourites to your account and pick up on any device. Guests can play everything — progress just stays on this device.</p>
              <button className="btn primary" onClick={signIn} disabled={busy}>{busy ? 'Opening Google…' : 'Sign in with Google'}</button>
              {err && <div className="howto" style={{ background: 'var(--pink-soft)' }}>{err}</div>}
              <p className="muted" style={{ margin: 0, fontSize: '.9rem' }}>For grown-ups and players 13+. We store only your display name, photo and game progress — nothing else.</p>
            </>
          )}
        </div>
      </main>
    </>
  )
}
