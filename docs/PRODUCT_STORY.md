# PlayPatch — Product Story

> A bright little patch of playground on the web: classic arcade games and brain-teasers for children, playable on a phone in the back seat or a laptop at the kitchen table.

## 1. The story

It is Saturday afternoon. **Aarav (8)** has his mum's phone and forty minutes before football. He opens PlayPatch in the browser — no app store, no sign-up — taps the big orange **Snake** tile, and swipes to steer a cheerful green snake around a pastel garden. When the snake bumps into itself, the screen doesn't shout "GAME OVER"; it giggles, shows "Ooh, so close! 27 apples!" and offers a **Play again** button the size of his thumb.

His sister **Meera (6)** leans over. She can't read long words yet, but every game tile has a picture and a one-word name, so she finds **Bubble Pop** on her own. Colours, sounds and stars — no score anxiety, no timers she can't see.

Later, **Dad** opens the same link on his laptop to check what they were playing. He finds a *Grown-ups* corner (behind a simple "hold for 3 seconds" gate) that shows how long each child played, lets him set a daily play limit and turns sound off for homework time. He also notices the **Brain Gym** tab: a 4×4 Sudoku, a "spot the difference", a maze and a "what comes next?" pattern game. He sets a house rule: *one Brain Gym puzzle unlocks fifteen minutes of arcade.*

On Sunday the family is on a train with no signal. PlayPatch still opens — it was installed to the home screen as a web app — and every game works offline. When Aarav beats his Snake record, a confetti burst and a new sticker appear in his **Sticker Book**. No account was ever created; progress lives on the device.

That's the product: **a safe, colourful, zero-friction arcade that works everywhere, with puzzles that quietly build focus.**

## 2. Who it's for

| Persona | Age | Device | What they need |
|---|---|---|---|
| Meera | 4–6 | Parent's phone/tablet | Picture-first navigation, one-finger controls, no reading required, instant restart |
| Aarav | 7–10 | Tablet, family laptop | Scores, records, unlockable stickers, a bit of challenge |
| Parent/teacher | Adult | Any | Safety, no ads/chat, play-time limits, evidence of "useful" play (puzzles) |

## 3. Product principles

1. **Child-safe by default** — no ads, no chat, no external links, no accounts, no data leaves the device (COPPA/GDPR-K friendly).
2. **One tap to fun** — a game starts within two taps of opening the site; a lost game restarts in one.
3. **Works on every screen** — touch, mouse and keyboard; portrait and landscape; phones from 360 px up; installable PWA; fully playable offline.
4. **Kind feedback** — no harsh "fail" states; encouraging copy; celebration animations; no dark patterns or manipulative timers.
5. **Colourful but calm** — bright, friendly palette; large rounded shapes; readable text (min 18 px in-game UI); reduced-motion option.
6. **Accessible** — keyboard-playable, colour-blind-safe palettes, captions for sound cues, adjustable speed/difficulty.

## 4. The game catalogue

Every game gets three difficulty levels (Easy / Normal / Hard), a Pause button, a one-tap restart and a "how to play" picture card.

### Arcade classics (the ones you asked for)
| Game | Child-friendly twist | Controls |
|---|---|---|
| **Snake** | Garden theme, snake eats fruit, grows with a happy "pop"; walls optional on Easy | Swipe / arrow keys / on-screen D-pad |
| **Tic-Tac-Toe** | Animals vs. fruits instead of X/O; play vs. friend (same device) or a friendly robot with 3 skill levels | Tap / click |
| **Brainvita (Peg Solitaire)** | Marbles are coloured gems; hints highlight legal jumps; undo; English and European boards | Tap-tap / drag |
| **Bubble Pop (Shooting)** | Aim and fire bubbles to pop matching colours — no weapons or violence; balloons and water-drops variants | Drag to aim, release to fire / mouse |
| **Kart Dash (Racing)** | Top-down cartoon kart race; collect stars, avoid puddles; no crashes — you just slow down | Tilt-free: left/right buttons or swipe lanes / arrow keys |

### Suggested additions (arcade)
- **Memory Match** — flip cards to find pairs (animals, shapes, numbers); great for 4–6.
- **Whack-a-Mole** — tap friendly moles popping from holes; rhythm and reflexes.
- **Brick Breaker** — bouncing ball breaks colourful bricks; paddle follows finger.
- **Fruit Catch** — move a basket to catch falling fruit, dodge the occasional boot.
- **Flappy Bee** — one-tap flying through flower gaps; short rounds, instant retry.
- **Connect Four** — drop discs; vs. friend or robot.
- **Simon Says (Colour Echo)** — repeat the growing colour/sound sequence; memory + attention.
- **2048 Jr.** — merge matching fruit pictures (4×4 grid); numbers shown optionally.
- **Dots & Boxes** — classic pencil game, two players on one device.
- **Pong / Air Hockey** — two thumbs, one phone; laptop uses keyboard for both.

### Brain Gym (concentration & brainstorming puzzles)
| Puzzle | What it trains |
|---|---|
| **Sudoku Jr.** (4×4 with pictures → 6×6 → 9×9) | Logic, patience |
| **Spot the Difference** | Visual attention |
| **Maze Runner** | Planning, spatial reasoning |
| **What Comes Next?** (shape/colour/number patterns) | Pattern recognition |
| **Odd One Out** | Categorisation, reasoning |
| **Sliding Picture Puzzle** (3×3 / 4×4) | Spatial, persistence |
| **Tangram** | Shapes and creativity |
| **Quick Maths** (timed addition/subtraction/tables) | Mental arithmetic |
| **Word Scramble & Picture Riddles** | Vocabulary, lateral thinking |
| **Memory Sequence** (remember where things were) | Working memory |

Brain Gym tracks **streaks** ("3 puzzles today!") rather than scores, and never shows a countdown on Easy.

### 🧪 Brain Lab (teens 14–18 — strategy, deduction & brainstorming)
Added after launch for older siblings: classic thinking games with real depth, no picture hints, harder difficulty curves and scores worth bragging about. Same safety rules, same offline PWA.

| Game | What it trains |
|---|---|
| **2048** (5×5 / 4×4 / 3×3) | Planning ahead, spatial strategy |
| **Minesweeper** (8×8 → 12×12) | Deduction, risk reasoning |
| **Word Guess** (Wordle-style, 5 letters) | Vocabulary, elimination logic |
| **Code Breaker** (Mastermind, up to 6 colours w/ repeats) | Hypothesis testing |
| **Lights Out** (3×3 / 5×5) | Pattern thinking, parity |
| *Planned:* **Nonogram**, **Make 24**, **Tower of Hanoi**, **Checkers vs robot**, **Sudoku 9×9** | Logic, arithmetic creativity, recursion, strategy |

## 5. Shared experience layer
- **Home** — big colourful tiles, three tabs: *Arcade*, *Brain Gym* and *Brain Lab*; a search-free grid on phones.
- **Sticker Book** — stickers unlocked by milestones across games; the only "progression" system.
- **Grown-ups corner** — hold-to-enter gate; play-time limits, sound/music toggle, reduced-motion, reset progress, export/import progress file.
- **Sound & music** — short, cheerful, optional; all cues also shown visually.
- **Offline-first PWA** — installable, caches all games; no backend needed for v1.
- **Localisation-ready** — copy in one strings file; picture-first UI minimises reading.

## 6. Technology recommendation

### Short answer: **yes — React + TypeScript is a good fit**, with HTML5 Canvas for the action games.

Why it fits:
- A games *portal* is mostly ordinary UI: home grid, menus, settings, sticker book, parental gate. React excels here, and TypeScript keeps a growing catalogue of games maintainable.
- Board/turn-based games (Tic-Tac-Toe, Brainvita, Connect Four, Memory, Sudoku, puzzles) are naturally React/SVG components.
- Real-time games (Snake, Bubble Pop, Kart Dash, Brick Breaker, Flappy Bee) need a `requestAnimationFrame` loop drawing on a `<canvas>`. That's a small, well-understood pattern inside a React component; **Phaser 3** (TypeScript-friendly) can be dropped in for the physics-heavier ones (racing, bubble shooter) if hand-rolled canvas becomes tedious.
- A PWA built with Vite runs on iOS/Android/desktop browsers from one codebase with no app-store friction — exactly what the story needs.

### Recommended stack
| Concern | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Safety across many small games sharing one interface |
| UI framework | **React 18+** | Portal UI, routing, settings, overlays |
| Build | **Vite** | Fast, first-class TS, PWA plugin |
| Styling | **CSS Modules + CSS variables** (or Tailwind) | Themeable palette, large touch targets |
| Game rendering | **HTML5 Canvas** via a tiny shared game-loop hook; **Phaser 3** optional for racing/shooter | Smooth 60 fps on mobile |
| State | **Zustand** | Tiny, simple; progress/settings stores |
| Persistence | **localStorage / IndexedDB (idb-keyval)** | No backend, no accounts |
| Offline/install | **vite-plugin-pwa** (Workbox) | Installable, offline-first |
| Audio | **Howler.js** | Reliable mobile audio unlock |
| Animation | **Framer Motion** (UI) / canvas (games) | Confetti, tile bounces |
| Testing | **Vitest** (game logic), **Playwright** (phone + desktop viewports) | Logic is pure TS → very testable |
| Hosting | **Vercel / Netlify / GitHub Pages** | Static, free, HTTPS (required for PWA) |

### Architecture in one picture
```
src/
  app/            shell, router, theme, parental gate
  games/
    registry.ts   list of games: id, title, icon, category, loader()
    snake/        each game = folder exporting a <Game/> component
    tictactoe/      + pure logic module (unit-tested)
    brainvita/
    bubblepop/
    kartdash/
    ...
  brain-gym/      puzzle modules, same interface
  shared/
    useGameLoop.ts   rAF loop + fixed-step update
    input.ts         unifies touch/swipe/keyboard/pointer
    audio.ts, store.ts, stickers.ts
```
Each game implements one small interface (`start / pause / resume / destroy`, emits `score` & `gameOver`) so the shell can handle pause overlays, restarts, sound and sticker awards uniformly, and games are **lazy-loaded** so the home screen stays fast.

### Alternatives considered
| Option | Verdict |
|---|---|
| **Phaser 3 only** (no React) | Great for games, clumsy for menus/settings/accessibility; best used *inside* React for a few games |
| **Svelte / SvelteKit + TS** | Equally good, slightly lighter; pick it only if the team prefers Svelte |
| **Godot 4 (web export)** | Excellent engine, but large WASM bundles and weaker mobile-browser performance; overkill for 2D classics |
| **Unity WebGL** | Too heavy for phone browsers; not child-web friendly |
| **Flutter Web** | Canvas-rendered UI, bigger bundles, poorer text/accessibility on web |
| **Vanilla JS + Canvas** | Fine for one game, painful for a catalogue of twenty |

**Recommendation: React + TypeScript + Vite, Canvas for real-time games (Phaser where useful), PWA for mobile.** No backend for v1.

## 7. Roadmap
| Phase | Scope |
|---|---|
| **MVP (v0.1)** | Shell + home grid, Snake, Tic-Tac-Toe, Memory Match, Sudoku Jr., Maze; PWA offline; sound toggle |
| **v0.2** | Brainvita, Bubble Pop, Kart Dash, Spot the Difference, What Comes Next?; Sticker Book; parental gate + play-time limit |
| **v0.3** | Remaining arcade/puzzle titles, difficulty levels everywhere, localisation, accessibility audit |
| **Later** | Optional two-device multiplayer (WebRTC), teacher/classroom mode, theme packs |

## 8. Success looks like
- A 6-year-old can start a game unaided within 10 seconds.
- 60 fps on a mid-range Android phone; < 200 KB initial JS, games lazy-loaded.
- Lighthouse PWA + Accessibility ≥ 95.
- Zero third-party trackers; zero network calls required after install.
