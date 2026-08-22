import { useState } from 'react'
import { Link } from 'react-router-dom'
import { GAMES } from '@/games/registry'
import { useStore } from '@/shared/store'
import type { Category } from '@/shared/store'
import { sfx } from '@/shared/audio'

export function Home() {
  const [tab, setTab] = useState<Category>('arcade')
  const best = useStore((s) => s.best)
  const stickers = useStore((s) => s.stickers.length)
  const list = GAMES.filter((g) => g.category === tab)

  return (
    <>
      <header className="topbar">
        <div className="brand"><img src="/icons/icon.svg" alt="" />PlayPatch</div>
        <div className="grow" />
        <Link className="btn" to="/stickers" aria-label="Sticker book">⭐ {stickers}</Link>
        <Link className="btn icon" to="/grown-ups" aria-label="Grown-ups corner">🔒</Link>
      </header>
      <main className="page">
        <div className="tabs" role="tablist">
          <button role="tab" className="tab" aria-selected={tab === 'arcade'} onClick={() => { sfx.unlock(); sfx.tap(); setTab('arcade') }}>🕹️ Arcade</button>
          <button role="tab" className="tab" aria-selected={tab === 'brain'} onClick={() => { sfx.unlock(); sfx.tap(); setTab('brain') }}>🧠 Brain Gym</button>
        </div>
        <div className="tiles">
          {list.map((g) => (
            <Link key={g.id} to={`/play/${g.id}`} className="tile" style={{ background: `var(--${g.color})` }} onClick={() => { sfx.unlock(); sfx.pop() }}>
              <span className="emoji" aria-hidden="true">{g.emoji}</span>
              <span className="name">{g.name}</span>
              {!g.ready && <span className="soon">SOON</span>}
              {g.ready && best[g.id] ? <span className="best">Best {best[g.id]}</span> : null}
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
