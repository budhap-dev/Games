import { useState } from 'react'
import type { CSSProperties } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { GameMeta } from '@/games/types'
import { GAMES } from '@/games/registry'
import { useStore } from '@/shared/store'
import type { Category } from '@/shared/store'
import { sfx } from '@/shared/audio'
import { authEnabled } from '@/shared/auth'
import { Icon } from '@/shared/Icon'
import type { IconName } from '@/shared/Icon'

const TABS: { id: Category; label: string; icon: IconName }[] = [
  { id: 'arcade', label: 'Arcade', icon: 'gamepad' },
  { id: 'brain', label: 'Brain Gym', icon: 'bulb' },
  { id: 'teen', label: 'Brain Lab', icon: 'flask' },
]
const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening' }
const READY = GAMES.filter((g) => g.ready).length

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

  const tile = (g: GameMeta, k: number) => (
    <div key={g.id} role="link" tabIndex={0} className="tile link" style={{ '--c': `var(--${g.color})`, '--i': k } as CSSProperties}
      onClick={() => { sfx.unlock(); sfx.pop(); nav(`/play/${g.id}`) }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); nav(`/play/${g.id}`) } }}
      aria-label={`${g.name}${isFav(g) ? ' (favourite)' : ''}`}>
      <button className={`fav ${isFav(g) ? 'on' : ''}`} aria-label={isFav(g) ? `Remove ${g.name} from favourites` : `Add ${g.name} to favourites`} aria-pressed={isFav(g)}
        onClick={(e) => { e.stopPropagation(); sfx.tap(); toggleFav(g.id) }}><i><Icon name={isFav(g) ? 'heartFill' : 'heart'} size={18} /></i></button>
      <span className="art"><span className="emoji" aria-hidden="true">{g.emoji}</span></span>
      <span className="name">{g.name}</span>
      {g.ready && best[g.id] ? <span className="best">Best {best[g.id]} {g.scoreLabel}</span> : null}
      {!g.ready && <span className="soon">SOON</span>}
    </div>
  )
  const tabIndex = TABS.findIndex((t) => t.id === tab)

  return (
    <>
      <header className="topbar">
        <div className="brand"><img src="/icons/icon.svg" alt="PlayPatch" /><span>PlayPatch</span></div>
        <div className="grow" />
        {authEnabled && (user ? <Link className="btn icon ghost" to="/account" aria-label={`Account: ${user.name}`}>{user.photo ? <img src={user.photo} alt="" width={30} height={30} style={{ borderRadius: '50%' }} referrerPolicy="no-referrer" /> : <Icon name="user" />}</Link> : <Link className="btn" to="/account">Sign in</Link>)}
        <Link className="btn icon ghost" to="/themes" aria-label="Themes"><Icon name="palette" /></Link>
        <Link className="btn" to="/stickers" aria-label={`Sticker book: ${stickers}`}><Icon name="star" size={20} /> {stickers}</Link>
        <Link className="btn icon ghost" to="/grown-ups" aria-label="Grown-ups corner"><Icon name="lock" /></Link>
      </header>
      <main className="page">
        <section className="hero">
          <p className="eyebrow">{greeting()}{user ? `, ${user.name}` : ''}</p>
          <h1>What shall we <em>play</em> today?</h1>
          <p className="sub"><span>{READY} games</span><span>Works offline</span><span>{user ? 'Progress synced' : 'No ads, ever'}</span></p>
        </section>
        <div className="tabs" role="tablist" style={{ '--i': tabIndex } as CSSProperties}>
          <span className="tab-ind" aria-hidden="true" />
          {TABS.map((t) => (
            <button key={t.id} role="tab" className="tab" aria-selected={tab === t.id} onClick={() => { sfx.unlock(); sfx.tap(); setTab(t.id) }}><Icon name={t.icon} size={20} />{t.label}</button>
          ))}
        </div>
        {favList.length > 0 && (
          <section aria-label="Favourites" style={{ marginBottom: 26 }}>
            <h2 className="section-title"><Icon name="heartFill" size={18} /> Favourites <small>{favList.length}</small></h2>
            <div className="tiles">{favList.map(tile)}</div>
          </section>
        )}
        <h2 className="section-title">{TABS[tabIndex].label} <small>{list.length} games</small></h2>
        <div className="tiles" key={tab}>{list.map(tile)}</div>
      </main>
    </>
  )
}
