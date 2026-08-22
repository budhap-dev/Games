import type { Dir } from './useInput'

export function DPad({ onDir }: { onDir: (d: Dir) => void }) {
  const press = (d: Dir) => (e: React.PointerEvent) => { e.preventDefault(); onDir(d) }
  return (
    <div className="dpad" aria-label="Direction pad">
      <button className="u" aria-label="Up" onPointerDown={press('up')}>▲</button>
      <button className="l" aria-label="Left" onPointerDown={press('left')}>◀</button>
      <button className="r" aria-label="Right" onPointerDown={press('right')}>▶</button>
      <button className="d" aria-label="Down" onPointerDown={press('down')}>▼</button>
    </div>
  )
}
