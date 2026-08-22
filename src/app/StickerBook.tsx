import { Link } from 'react-router-dom'
import { STICKERS } from '@/shared/stickers'
import { useStore } from '@/shared/store'

export function StickerBook() {
  const got = useStore((s) => s.stickers)
  return (
    <>
      <header className="topbar">
        <Link className="btn icon" to="/" aria-label="Back">🏠</Link>
        <h1 style={{ fontSize: '1.6rem' }}>⭐ Sticker Book</h1>
        <div className="grow" />
        <span className="score-pill">{got.length} / {STICKERS.length}</span>
      </header>
      <main className="page">
        <div className="stickers">
          {STICKERS.map((s) => {
            const has = got.includes(s.id)
            return (
              <div key={s.id} className={`sticker ${has ? 'got' : 'locked'}`} title={s.hint}>
                <span className="em" aria-hidden="true">{has ? s.emoji : '❔'}</span>
                <span className="nm">{has ? s.name : s.hint}</span>
              </div>
            )
          })}
        </div>
      </main>
    </>
  )
}
