import { useEffect, useState } from 'react'
import { useCloudSync } from '@/shared/useCloudSync'
import { Account } from './Account'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '@/shared/store'
import { Themes } from './Themes'
import { Home } from './Home'
import { GamePage } from './GamePage'
import { GrownUps } from './GrownUps'
import { StickerBook } from './StickerBook'

export default function App() {
  const theme = useStore((s) => s.theme)
  const palette = useStore((s) => s.palette)
  const [welcome, setWelcome] = useState<string | null>(null)
  const nav = useNavigate()
  const loc = useLocation()
  useCloudSync((name) => {
    setWelcome(name); window.setTimeout(() => setWelcome(null), 4000)
    // after signing in, go back to the games (the Account page only exists to sign in/out)
    if (loc.pathname === '/account') nav('/', { replace: true })
  })
  useEffect(() => {
    const el = document.documentElement
    if (theme === 'system') delete el.dataset.theme; else el.dataset.theme = theme
    if (palette === 'classic') delete el.dataset.palette; else el.dataset.palette = palette
  }, [theme, palette])
  return (
    <div className="app">
      {welcome && <div className="toast" role="status">👋 Welcome, {welcome}!</div>}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:id" element={<GamePage />} />
        <Route path="/stickers" element={<StickerBook />} />
        <Route path="/grown-ups" element={<GrownUps />} />
        <Route path="/themes" element={<Themes />} />
        <Route path="/account" element={<Account />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}
