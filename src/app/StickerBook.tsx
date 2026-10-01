import type { CSSProperties } from 'react'
import { PageHeader } from './PageHeader'
import { STICKERS } from '@/shared/stickers'
import { useStore } from '@/shared/store'

export function StickerBook() {
  const got = useStore((s) => s.stickers)
  return (
    <>
      <PageHeader title="Sticker Book">
        <span className="score-pill">{got.length} / {STICKERS.length}</span>
      </PageHeader>
      <main className="page">
        <div className="stickers">
          {STICKERS.map((s, i) => {
            const has = got.includes(s.id)
            return (
              <div key={s.id} className={`sticker ${has ? 'got' : 'locked'}`} title={s.hint} style={{ '--i': i } as CSSProperties}>
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
