import { useEffect, useRef } from 'react'

export type Dir = 'up' | 'down' | 'left' | 'right'

const KEYS: Record<string, Dir> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right',
}

/** Arrow/WASD keys + swipe gestures anywhere on the page → direction callback. */
export function useDirectionInput(onDir: (d: Dir) => void, enabled = true) {
  const cb = useRef(onDir)
  cb.current = onDir
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      const d = KEYS[e.key]
      if (d) { e.preventDefault(); cb.current(d) }
    }
    let sx = 0, sy = 0, active = false
    const onStart = (e: TouchEvent) => {
      const t = e.touches[0]
      sx = t.clientX; sy = t.clientY; active = true
    }
    const onMove = (e: TouchEvent) => {
      if (!active) return
      const t = e.touches[0]
      const dx = t.clientX - sx, dy = t.clientY - sy
      if (Math.hypot(dx, dy) < 24) return
      active = false
      if (Math.abs(dx) > Math.abs(dy)) cb.current(dx > 0 ? 'right' : 'left')
      else cb.current(dy > 0 ? 'down' : 'up')
    }
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: true })
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
    }
  }, [enabled])
}
