import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { GameProps } from '@/games/types'
import { canMove, generateMaze, move } from './logic'
import { useDirectionInput } from '@/shared/useInput'
import type { Dir } from '@/shared/useInput'
import { DPad } from '@/shared/DPad'
import { useCanvasSize } from '@/shared/useCanvas'
import { sfx } from '@/shared/audio'

const SIZE = { easy: 7, normal: 10, hard: 14 }

export default function MazeGame({ difficulty, paused, onScore, onEnd }: GameProps) {
  const n = SIZE[difficulty]
  const maze = useMemo(() => generateMaze(n), [n])
  const canvas = useRef<HTMLCanvasElement>(null)
  const size = useCanvasSize(canvas)
  const [pos, setPos] = useState<[number, number]>([0, 0])
  const [steps, setSteps] = useState(0)
  const done = useRef(false)

  const go = useCallback((d: Dir) => {
    if (paused || done.current) return
    setPos(([x, y]) => {
      if (!canMove(maze, x, y, d)) { sfx.tap(); return [x, y] }
      sfx.flip()
      setSteps((s) => s + 1)
      return move(x, y, d)
    })
  }, [maze, paused])
  useDirectionInput(go, !paused)

  useEffect(() => {
    if (pos[0] === n - 1 && pos[1] === n - 1 && !done.current) {
      done.current = true
      sfx.good(); onScore(1)
      setTimeout(() => onEnd({ score: 1, won: true, message: `You found the star in ${steps} steps!`, emoji: '⭐' }), 400)
    }
  }, [pos, n, steps, onScore, onEnd])

  useEffect(() => {
    const c = canvas.current
    if (!c || !size) return
    const ctx = c.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const pad = 10, cell = (size - pad * 2) / n
    ctx.fillStyle = '#fff7e6'; ctx.fillRect(0, 0, size, size)
    ctx.strokeStyle = '#7b4fd6'; ctx.lineWidth = Math.max(3, cell * 0.12); ctx.lineCap = 'round'; ctx.lineJoin = 'round'
    ctx.beginPath()
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const w = maze.cells[y * n + x]
      const X = pad + x * cell, Y = pad + y * cell
      if (w & 1) { ctx.moveTo(X, Y); ctx.lineTo(X + cell, Y) }
      if (w & 2) { ctx.moveTo(X + cell, Y); ctx.lineTo(X + cell, Y + cell) }
      if (w & 4) { ctx.moveTo(X, Y + cell); ctx.lineTo(X + cell, Y + cell) }
      if (w & 8) { ctx.moveTo(X, Y); ctx.lineTo(X, Y + cell) }
    }
    ctx.stroke()
    ctx.font = `${cell * 0.7}px serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
    ctx.fillText('⭐', pad + (n - 0.5) * cell, pad + (n - 0.45) * cell)
    ctx.fillText('🐰', pad + (pos[0] + 0.5) * cell, pad + (pos[1] + 0.55) * cell)
  }, [maze, n, pos, size])

  return (
    <>
      <div className="turn">👣 {steps} steps</div>
      <div className="stage"><canvas ref={canvas} aria-label="Maze" /></div>
      <DPad onDir={go} />
    </>
  )
}
