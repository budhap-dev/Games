import { useEffect, useRef, useState } from 'react'
import type { GameProps } from '@/games/types'
import { FIGURES, PIECES, centroid, snaps } from './logic'
import type { Pt } from './logic'
import { sfx } from '@/shared/audio'

// SVG space: 10 wide × 11 tall, y down. Figure sits at the top, centred; tray below.
const VW = 10, VH = 11
const PICK = { easy: 0, normal: 1, hard: 2 }
const TRAY: Pt[] = [[1.2, 3.3], [8.6, 3.4], [5, 3.4], [2.6, 1.3], [5.2, 1.3], [7.2, 1.7], [8.7, 1.7]]

export default function TangramGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const fig = FIGURES[PICK[difficulty]]
  const showOutlines = difficulty !== 'hard'
  const FX = (VW - fig.w) / 2, FY = VH - 0.4 - fig.h // figure origin in "up" coords
  // convert piece-space (x right, y up, figure origin) to svg coords
  const toSvg = ([x, y]: Pt, off: Pt): string => `${FX + x + off[0]},${VH - (FY + y + off[1])}`
  const svgRef = useRef<SVGSVGElement>(null)
  const [offsets, setOffsets] = useState<Record<string, Pt>>(() => {
    // tray: spread pieces below the figure (absolute "up" coords → offsets relative to figure origin)
    const o: Record<string, Pt> = {}
    PIECES.forEach((p, i) => { const c = centroid(p.pts); const s = TRAY[i]; o[p.id] = [s[0] - FX - c[0] + (Math.random() - 0.5) * 0.4, s[1] - FY - c[1] + (Math.random() - 0.5) * 0.3] })
    return o
  })
  const [locked, setLocked] = useState<Set<string>>(new Set())
  const drag = useRef<{ id: string; start: Pt; orig: Pt } | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)

  const svgPoint = (e: PointerEvent | React.PointerEvent): Pt => {
    const r = svgRef.current!.getBoundingClientRect()
    return [((e.clientX - r.left) / r.width) * VW, ((e.clientY - r.top) / r.height) * VH]
  }
  const onDown = (id: string) => (e: React.PointerEvent) => {
    if (paused || locked.has(id)) return
    e.preventDefault()
    drag.current = { id, start: svgPoint(e), orig: offsets[id] }
    setDragging(id)
    ;(e.target as Element).setPointerCapture(e.pointerId)
    sfx.tap()
  }
  useEffect(() => {
    const move = (e: PointerEvent) => {
      const d = drag.current; if (!d) return
      const p = svgPoint(e)
      setOffsets((o) => ({ ...o, [d.id]: [d.orig[0] + (p[0] - d.start[0]), d.orig[1] - (p[1] - d.start[1])] }))
    }
    const up = () => {
      const d = drag.current; if (!d) return
      drag.current = null; setDragging(null)
      setOffsets((o) => {
        const off = o[d.id], tgt = fig.targets[d.id]
        if (snaps(off, tgt)) {
          sfx.good()
          setLocked((l) => {
            const n = new Set(l); n.add(d.id); onScore(n.size)
            if (n.size === PIECES.length) setTimeout(() => onEnd({ score: PIECES.length, won: true, message: `You built the ${fig.name}!`, emoji: fig.emoji }), 500)
            return n
          })
          return { ...o, [d.id]: tgt }
        }
        return o
      })
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fig])

  // draw order: locked first, dragging last
  const order = [...PIECES].sort((a, b) => (a.id === dragging ? 1 : b.id === dragging ? -1 : 0))
  return (
    <>
      <div className="turn">{fig.emoji} {fig.name} · {locked.size} / {PIECES.length} pieces</div>
      <svg ref={svgRef} className="tangram" viewBox={`0 0 ${VW} ${VH}`} role="img" aria-label={`Tangram ${fig.name}`}>
        {PIECES.map((p) => (
          <polygon key={`t-${p.id}`} className="target" points={p.pts.map((pt) => toSvg(pt, fig.targets[p.id])).join(' ')} style={showOutlines ? undefined : { stroke: 'none' }} />
        ))}
        {!showOutlines && PIECES.map((p) => (
          <polygon key={`o-${p.id}`} points={p.pts.map((pt) => toSvg(pt, fig.targets[p.id])).join(' ')} fill="var(--line)" stroke="none" />
        ))}
        {order.map((p) => (
          <polygon
            key={p.id}
            className={`piece ${locked.has(p.id) ? 'locked' : ''} ${dragging === p.id ? 'drag' : ''}`}
            points={p.pts.map((pt) => toSvg(pt, offsets[p.id])).join(' ')}
            fill={p.color}
            onPointerDown={onDown(p.id)}
            aria-label={`${p.id} piece`}
          />
        ))}
      </svg>
    </>
  )
}
