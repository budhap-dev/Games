import { describe, it, expect } from 'vitest'
import { allMoves, applyMove, createBoard, pegCount, squareName } from './logic'

describe('brainvita', () => {
  it('english board starts with 32 gems and 4 opening moves', () => {
    const b = createBoard('english')
    expect(pegCount(b)).toBe(32)
    expect(allMoves(b).length).toBe(4)
  })
  it('european board has 36 gems', () => {
    expect(pegCount(createBoard('european'))).toBe(36)
  })
  it('a move removes the jumped gem', () => {
    const b = createBoard()
    const m = allMoves(b)[0]
    const n = applyMove(b, m)
    expect(pegCount(n)).toBe(31)
    expect(n[m.over]).toBe(false)
    expect(n[m.to]).toBe(true)
    expect(n[m.from]).toBe(false)
  })
  it('names squares a1–g7 from the top-left', () => {
    expect(squareName(0)).toBe('a1')
    expect(squareName(24)).toBe('d4')
    expect(squareName(48)).toBe('g7')
    expect(squareName(10)).toBe('d2')
  })
})
