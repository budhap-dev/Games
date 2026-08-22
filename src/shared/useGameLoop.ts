import { useEffect, useRef } from 'react'

/**
 * Fixed-step game loop. `update` runs every `stepMs`; `render` runs every frame.
 * Both callbacks are read through refs, so you can pass fresh closures each render.
 */
export function useGameLoop(
  running: boolean,
  stepMs: number,
  update: () => void,
  render: () => void,
) {
  const updateRef = useRef(update)
  const renderRef = useRef(render)
  updateRef.current = update
  renderRef.current = render

  // The frame loop always runs (cheap) so the canvas is drawn immediately — countdowns, paused
  // boards and first paint all show; `update` only advances while `running`.
  useEffect(() => {
    let raf = 0
    let last = performance.now()
    let acc = 0
    const frame = (now: number) => {
      if (running) {
        acc += Math.min(now - last, 250)
        while (acc >= stepMs) {
          updateRef.current()
          acc -= stepMs
        }
      } else acc = 0
      last = now
      renderRef.current()
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [running, stepMs])
}
