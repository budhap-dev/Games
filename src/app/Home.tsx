import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameMeta } from '@/games/types'
import { GAMES } from '@/games/registry'
import { useStore } from '@/shared/store'
import type { Category } from '@/shared/store'
import { sfx } from '@/shared/audio'
import { authEnabled } from '@/shared/auth'

export function Home() {
  const [tab, setTab] = useState<Category>('arcade')
  const best = useStore((s) => s.best)
  const stickers = useStore((s) => s.stickers.length)
  const favs = useStore((s) => s.favs)
  const user = useStore((s) => s.user)
  const toggleFav = useStore((s) => s.toggleFav)
  const nav = useNavigate()
  const isFav = (g: GameMeta) => favs.includes(g.id)
  const list = GAMES.filter((g) => g.category === tab).sort((a, b) => Number(isFav(b)) - Number(isFav(a)))
  const favList = favs.map((id) => GAMES.find((g) => g.id === id)).filter((g): g is GameMeta => !!g)

  const tile = (g: GameMeta) => (
    <div key={g.id} role="link" tabIndex={0} className="tile link" style={{ background: `var(--${g.color})` }}
      onClick={() => { sfx.unlock(); sfx.pop(); nav(`/play/${g.id}`) }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav(`/play/${g.id}`) } }}
      aria-label={`${g.name}${isFav(g) ? ' (favourite)' : ''}`}>
      <button className={`fav ${isFav(g) ? 'on' : ''}`} aria-label={isFav(g) ? `Remove ${g.name} from favourites` : `Add ${g.name} to favourites`} aria-pressed={isFav(g)}
        onClick={(e) => { e.stopPropagation(); sfx.tap(); toggleFav(g.id) }}>{isFav(g) ? '❤️' : '🤍'}</button>
      <span className="emoji" aria-hidden="true">{g.emoji}</span>
      <span className="name">{g.name}</span>
      {!g.ready && <span className="soon">SOON</span>}
      {g.ready && best[g.id] ? <span className="best">Best {best[g.id]}</span> : null}
    </div>
  )

  return (
    <>
      <header className="topbar">
        <div className="brand"><img src="/icons/icon.svg" alt="PlayPatch" /><span>PlayPatch</span></div>
        <div className="grow" />
        {authEnabled && (user ? <Link className="btn icon" to="/account" aria-label={`Account: ${user.name}`}>{user.photo ? <img src={user.photo} alt="" width={30} height={30} style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" /> : '👤'}</Link> : <Link className="btn" to="/account">Sign in</Link>)}
        <Link className="btn icon" to="/themes" aria-label="Themes">🎨</Link>
        <Link className="btn" to="/stickers" aria-label="Sticker book">⭐ {stickers}</Link>
        <Link className="btn icon" to="/grown-ups" aria-label="Grown-ups corner">🔒</Link>
      </header>
      <main className="page">
        <div className="tabs" role="tablist">
          <button role="tab" className="tab" aria-selected={tab === 'arcade'} onClick={() => { sfx.unlock(); sfx.tap(); setTab('arcade') }}>🕹️ Arcade</button>
          <button role="tab" className="tab" aria-selected={tab === 'brain'} onClick={() => { sfx.unlock(); sfx.tap(); setTab('brain') }}>🧠 Brain Gym</button>
          <button role="tab" className="tab" aria-selected={tab === 'teen'} onClick={() => { sfx.unlock(); sfx.tap(); setTab('teen') }}>🧪 Brain Lab</button>
        </div>
        {favList.length > 0 && (
          <section aria-label="Favourites" style={{ marginBottom: 22 }}>
            <h2 className="section-title">❤️ Favourites</h2>
            <div className="tiles">{favList.map(tile)}</div>
          </section>
        )}
        <div className="tiles">{list.map(tile)}</div>
      </main>
    </>
  )
}
