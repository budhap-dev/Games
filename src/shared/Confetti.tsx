import { useEffect, useRef } from 'react'
import { useStore } from './store'

const COLORS = ['#ff7a1a', '#2d9cdb', '#3fb55b', '#7b4fd6', '#ffc93c', '#ff5fa2']

export function Confetti({ burst }: { burst: number }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useStore((s) => s.reducedMotion)
  useEffect(() => {
    if (!burst || reduced) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const c = ref.current!
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    c.width = innerWidth * dpr; c.height = innerHeight * dpr
    ctx.scale(dpr, dpr)
    const parts = Array.from({ length: 120 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 80, y: innerHeight * 0.4,
      vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4,
      r: 5 + Math.random() * 6, col: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
    }))
    let raf = 0, t = 0
    const tick = () => {
      ctx.clearRect(0, 0, innerWidth, innerHeight)
      for (const p of parts) {
        p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot); ctx.fillStyle = p.col
        ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 0.6); ctx.restore()
      }
      if (++t < 110) raf = requestAnimationFrame(tick)
      else ctx.clearRect(0, 0, innerWidth, innerHeight)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [burst, reduced])
  return <canvas className="confetti" ref={ref} aria-hidden="true" />
}
