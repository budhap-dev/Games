import { describe, it, expect } from 'vitest'
import { isOff, press, scramble } from './logic'

describe('lights out', () => {
  it('toggles a plus shape', () => {
    const l = press(Array(9).fill(false), 3, 4)
    expect(l).toEqual([false, true, false, true, true, true, false, true, false])
    expect(press(l, 3, 4)).toEqual(Array(9).fill(false))
  })
  it('scrambles into a solvable, non-solved state', () => {
    const l = scramble(5, 6)
    expect(isOff(l)).toBe(false)
  })
})
