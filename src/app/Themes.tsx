import type { CSSProperties } from 'react'
import { useStore } from '@/shared/store'
import type { Palette, Theme } from '@/shared/store'
import { sfx } from '@/shared/audio'
import { Icon } from '@/shared/Icon'
import { PageHeader } from './PageHeader'

// Ids are persisted, so they keep their original names; the labels are what people see.
const PALETTES: { id: Palette; name: string; colors: string[] }[] = [
  { id: 'classic', name: 'Sunrise', colors: ['#f97316', '#f5b82e', '#ec4899', '#8b5cf6'] },
  { id: 'ocean', name: 'Ocean', colors: ['#0284c7', '#0ea5e9', '#14b8a6', '#6366f1'] },
  { id: 'candy', name: 'Blossom', colors: ['#db2777', '#fb7185', '#c084fc', '#818cf8'] },
  { id: 'jungle', name: 'Forest', colors: ['#15803d', '#16a34a', '#eab308', '#0891b2'] },
  { id: 'space', name: 'Nebula', colors: ['#7c3aed', '#8b5cf6', '#e879f9', '#38bdf8'] },
]
const THEMES: { id: Theme; label: string }[] = [{ id: 'system', label: 'Auto' }, { id: 'light', label: 'Light' }, { id: 'dark', label: 'Dark' }]
const PREVIEW = [{ c: 'orange', e: '🐍', n: 'Snake' }, { c: 'sky', e: '🫧', n: 'Bubbles' }, { c: 'grape', e: '🦊', n: 'Memory' }]

export function Themes() {
  const theme = useStore((s) => s.theme), palette = useStore((s) => s.palette)
  const setTheme = useStore((s) => s.setTheme), setPalette = useStore((s) => s.setPalette)
  return (
    <>
      <PageHeader title="Themes" />
      <main className="page">
        <div className="card stack" style={{ maxWidth: 680, margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.15rem' }}>Appearance</h2>
          <div className="seg" role="group" aria-label="Appearance">
            {THEMES.map((t) => <button key={t.id} aria-pressed={theme === t.id} onClick={() => { sfx.tap(); setTheme(t.id) }}>{t.label}</button>)}
          </div>
          <p className="muted" style={{ margin: 0, fontSize: '.95rem' }}>Auto follows your phone or computer setting.</p>
          <h2 style={{ fontSize: '1.15rem', marginTop: 8 }}>Colour theme</h2>
          <div className="palettes">
            {PALETTES.map((p) => (
              <button key={p.id} className="pal" aria-pressed={palette === p.id} onClick={() => { sfx.pop(); setPalette(p.id) }}>
                <span className="swatch" style={{ background: `linear-gradient(135deg, ${p.colors.join(', ')})` }} />
                <b>{p.name}{palette === p.id && <Icon name="check" size={18} />}</b>
              </button>
            ))}
          </div>
          <h2 style={{ fontSize: '1.15rem', marginTop: 8 }}>Preview</h2>
          <div className="theme-preview" aria-hidden="true">
            {PREVIEW.map((t, i) => <div key={t.c} className="tile" style={{ '--c': `var(--${t.c})`, '--i': i } as CSSProperties}><span className="art"><span className="emoji">{t.e}</span></span><span className="name">{t.n}</span></div>)}
          </div>
        </div>
      </main>
    </>
  )
}
