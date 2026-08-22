/** Secret with distinct digits; first digit may be 0 (classic rules vary — we allow it). */
export function makeSecret(len: number, rnd: () => number = Math.random): string {
  const d = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [d[i], d[j]] = [d[j], d[i]] }
  return d.slice(0, len).join('')
}
export function bullsCows(guess: string, secret: string): { bulls: number; cows: number } {
  let bulls = 0, cows = 0
  for (let i = 0; i < secret.length; i++) {
    if (guess[i] === secret[i]) bulls++
    else if (secret.includes(guess[i])) cows++
  }
  return { bulls, cows }
}
export const hasRepeats = (s: string) => new Set(s).size !== s.length
