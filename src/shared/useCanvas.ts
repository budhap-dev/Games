import { useEffect, useState } from 'react'
import type { RefObject } from 'react'

/** Keeps a canvas's backing store in sync with its CSS size × devicePixelRatio. Returns CSS px size. */
export function useCanvasSize(ref: RefObject<HTMLCanvasElement>) {
  const [size, setSize] = useState(0)
  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ro = new ResizeObserver(() => {
      const s = Math.floor(c.clientWidth)
      const dpr = window.devicePixelRatio || 1
      c.width = s * dpr
      c.height = s * dpr
      setSize(s)
    })
    ro.observe(c)
    return () => ro.disconnect()
  }, [ref])
  return size
}

export const rrect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
  ctx.fill()
}
