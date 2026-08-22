/** Mastermind feedback: black = right colour & position, white = right colour, wrong position. */
export function feedback(guess: number[], code: number[]): { black: number; white: number } {
  let black = 0
  const gLeft: number[] = [], cLeft: number[] = []
  guess.forEach((g, i) => { if (g === code[i]) black++; else { gLeft.push(g); cLeft.push(code[i]) } })
  let white = 0
  for (const g of gLeft) { const j = cLeft.indexOf(g); if (j >= 0) { white++; cLeft.splice(j, 1) } }
  return { black, white }
}

export function makeCode(colours: number, pegs: number, repeats: boolean, rnd: () => number = Math.random): number[] {
  const pool = Array.from({ length: colours }, (_, i) => i)
  const out: number[] = []
  for (let i = 0; i < pegs; i++) {
    const cands = repeats ? pool : pool.filter((c) => !out.includes(c))
    out.push(cands[Math.floor(rnd() * cands.length)])
  }
  return out
}
