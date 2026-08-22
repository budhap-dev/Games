import { useMemo, useState } from 'react'
import type { GameProps } from '@/games/types'
import { generateScene, hitTest } from './logic'
import type { Item } from './logic'
import { sfx } from '@/shared/audio'

const COUNT = { easy: 3, normal: 5, hard: 7 }

export default function SpotGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const n = COUNT[difficulty]
  const scene = useMemo(() => generateScene(n), [n])
  const [found, setFound] = useState<number[]>([])
  const [shake, setShake] = useState<'l' | 'r' | null>(null)
  const [done, setDone] = useState(false)

  const tap = (side: 'l' | 'r') => (e: React.PointerEvent<HTMLDivElement>) => {
    if (paused || done) return
    const b = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - b.left) / b.width) * 100, y = ((e.clientY - b.top) / b.height) * 100
    const hit = hitTest(scene, x, y)
    if (hit && !found.includes(hit.id)) {
      const f = [...found, hit.id]
      setFound(f); sfx.good(); onScore(f.length)
      if (f.length === n) { setDone(true); setTimeout(() => onEnd({ score: n, won: true, message: `You found all ${n}!`, emoji: '🔍' }), 500) }
    } else {
      sfx.bad(); setShake(side); setTimeout(() => setShake(null), 320)
    }
  }

  const panel = (items: Item[], side: 'l' | 'r') => (
    <div className={`spot-panel ${shake === side ? 'shake' : ''}`} onPointerDown={tap(side)} role="img" aria-label={side === 'l' ? 'Left picture' : 'Right picture'}>
      {items.map((it) => it.emoji && (
        <span key={it.id} className="it" style={{ left: `${it.x}%`, top: `${it.y}%`, fontSize: `${it.size}cqw` }}>{it.emoji}</span>
      ))}
      {found.map((id) => { const it = scene.left.find((i) => i.id === id)!; return <span key={id} className="mark" style={{ left: `${it.x}%`, top: `${it.y}%` }} /> })}
    </div>
  )

  return (
    <>
      <div className="turn">🔍 {found.length} / {n} found</div>
      <div className="spot-wrap">
        {panel(scene.left, 'l')}
        {panel(scene.right, 'r')}
      </div>
    </>
  )
}
