import { Link } from 'react-router-dom'
import { useStore } from '@/shared/store'
import type { Palette, Theme } from '@/shared/store'
import { sfx } from '@/shared/audio'

const PALETTES: { id: Palette; name: string; emoji: string; dots: string[] }[] = [
  { id: 'classic', name: 'Classic', emoji: '🎨', dots: ['#ff7a1a', '#2d9cdb', '#3fb55b', '#7b4fd6', '#ffc93c'] },
  { id: 'ocean', name: 'Ocean', emoji: '🌊', dots: ['#ff8a5b', '#1e88e5', '#26c6a6', '#5c6bc0', '#ffd54f'] },
  { id: 'candy', name: 'Candy', emoji: '🍭', dots: ['#ff8c42', '#7c9cff', '#63d471', '#c77dff', '#ff5d8f'] },
  { id: 'jungle', name: 'Jungle', emoji: '🌿', dots: ['#f4a259', '#3fa7d6', '#3c9d4e', '#8e6bbf', '#f2c14e'] },
  { id: 'space', name: 'Space', emoji: '🚀', dots: ['#ff7b54', '#4cc9f0', '#80ffdb', '#9b5de5', '#fee440'] },
]
const THEMES: { id: Theme; label: string }[] = [{ id: 'system', label: '📱 Auto' }, { id: 'light', label: '☀️ Light' }, { id: 'dark', label: '🌙 Dark' }]

export function Themes() {
  const theme = useStore((s) => s.theme), palette = useStore((s) => s.palette)
  const setTheme = useStore((s) => s.setTheme), setPalette = useStore((s) => s.setPalette)
  return (
    <>
      <header className="topbar">
        <Link className="btn icon" to="/" aria-label="Back">🏠</Link>
        <h1 style={{ fontSize: '1.6rem' }}>🎨 Themes</h1>
      </header>
      <main className="page">
        <div className="card stack" style={{ maxWidth: 640, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.25rem' }}>Light or dark?</h2>
          <div className="seg" role="group" aria-label="Appearance">
            {THEMES.map((t) => <button key={t.id} aria-pressed={theme === t.id} onClick={() => { sfx.tap(); setTheme(t.id) }}>{t.label}</button>)}
          </div>
          <p className="muted" style={{ margin: 0 }}>Auto follows your phone or computer setting.</p>
          <h2 style={{ fontSize: '1.25rem', marginTop: 8 }}>Pick a colour world</h2>
          <div className="palettes">
            {PALETTES.map((p) => (
              <button key={p.id} className="pal" aria-pressed={palette === p.id} onClick={() => { sfx.pop(); setPalette(p.id) }}>
                <b>{p.emoji} {p.name}</b>
                <span className="dots">{p.dots.map((c) => <i key={c} style={{ background: c }} />)}</span>
              </button>
            ))}
          </div>
          <div className="tiles" aria-label="Preview" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {['orange', 'sky', 'lime'].map((c, i) => <div key={c} className="tile" style={{ background: `var(--${c})`, aspectRatio: '1.3' }}><span className="emoji">{['🐍', '🐱', '🦊'][i]}</span><span className="name">Preview</span></div>)}
          </div>
        </div>
      </main>
    </>
  )
}
