import { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import { useStore } from '@/shared/store'
import { Themes } from './Themes'
import { Home } from './Home'
import { GamePage } from './GamePage'
import { GrownUps } from './GrownUps'
import { StickerBook } from './StickerBook'

export default function App() {
  const theme = useStore((s) => s.theme)
  const palette = useStore((s) => s.palette)
  useEffect(() => {
    const el = document.documentElement
    if (theme === 'system') delete el.dataset.theme; else el.dataset.theme = theme
    if (palette === 'classic') delete el.dataset.palette; else el.dataset.palette = palette
  }, [theme, palette])
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:id" element={<GamePage />} />
        <Route path="/stickers" element={<StickerBook />} />
        <Route path="/grown-ups" element={<GrownUps />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}
