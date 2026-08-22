import { Route, Routes } from 'react-router-dom'
import { Home } from './Home'
import { GamePage } from './GamePage'
import { GrownUps } from './GrownUps'
import { StickerBook } from './StickerBook'

export default function App() {
  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play/:id" element={<GamePage />} />
        <Route path="/stickers" element={<StickerBook />} />
        <Route path="/grown-ups" element={<GrownUps />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  )
}
