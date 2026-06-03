# Handoff: COINDROP — multiplayer lobby & tic-tac-toe

## Overview
COINDROP is a small multiplayer web app: people drop into a shared lobby, see who's
online, chat, and challenge each other to quick games of tic-tac-toe. The game is
deliberately trivial — the personality lives in the **social lobby**, which should
feel like a lively, late-night corner arcade. The aesthetic is **refined CRT-cabinet
nostalgia**: deep dark background, one committed neon accent (electric cyan), subtle
scanline/grain texture, crisp geometric layout.

This package documents four screens (Lobby, Game, Leaderboard, Match History) plus
three transient moments (an incoming-challenge "coin drop", outgoing matchmaking, and
a win flourish), so they can be rebuilt in a real **SvelteKit** app.

---

## About the Design Files
The files in `reference/` are a **design reference built in HTML + React (JSX)**. They
are a working prototype that shows the intended look, motion, and behavior — they are
**not** production code to copy verbatim. The task is to **recreate these designs in
the target SvelteKit codebase** using its idioms (`.svelte` components, stores, `{#each}`,
`transition:`/`animate:`, scoped styles or the shared stylesheet).

The good news: the visual system is already expressed as **plain CSS custom properties**
in `reference/arcade.css`. That file is framework-agnostic and can be dropped into
SvelteKit almost as-is (e.g. `src/app.css` or `src/lib/styles/arcade.css`, imported in
the root `+layout.svelte`). Port the React components to Svelte; keep the CSS.

> The prototype uses React only because that was the prototyping tool. Nothing about the
> design depends on React — the component boundaries map cleanly onto Svelte components.

---

## Fidelity
**High-fidelity.** Final colors, typography, spacing, motion, and interactions are all
intended as shown. Rebuild pixel-faithfully. Exact tokens are in `reference/arcade.css`
and restated under **Design Tokens** below.

---

## Tech mapping (React prototype → SvelteKit)

| Prototype (React) | SvelteKit target |
|---|---|
| `arcade.css` (CSS variables, components, keyframes) | Use as-is. Global stylesheet imported in `+layout.svelte`. |
| `App` (`app.jsx`) — shell, nav, top-level state | `+layout.svelte` + route pages, or one `App.svelte`. State in a Svelte store. |
| `useTweaks` + `TweaksPanel` (`tweaks-panel.jsx`) | **Drop entirely** for production — this is a design-exploration tool, not a product feature. Pick the default token values (see below) and hard-code them. |
| `Lobby`, `Roster`, `Chat`, `GamesCatalog` (`lobby.jsx`) | `Lobby.svelte` + child components |
| `GameScreen`, `Board`, `TurnIndicator`, `Confetti` (`game.jsx`) | `GameScreen.svelte` etc. Game logic (`winnerOf`, `aiMove`) is pure JS → move to `src/lib/ttt.js` |
| `Leaderboard`, `MatchHistory` (`boards.jsx`) | route pages |
| `ChallengeModal`, `Matchmaking` (`challenge.jsx`) | overlay components, conditionally rendered |
| `PixelSprite`, `MarkX`, `MarkO` (`sprites.jsx`) | `PixelSprite.svelte` — same SVG, data-driven |
| `Avatar`, `StatusBadge`, `Wordmark`, `LiveDot` (`ui.jsx`) | small presentational components |
| `PLAYERS`, `SEED_CHAT`, `HISTORY`, etc. (`data.jsx`) | Mock data → replace with real-time backend (see **State / Realtime**) |

The prototype simulates the "multiplayer" with timers and a local AI. In production these
become a realtime backend (WebSocket / SSE / presence service). The UI contracts below
describe exactly what data each component needs.

---

## Layout — global shell

The whole app sits in a centered shell (`.shell`):
- `max-width: 1320px`, `margin: 0 auto`, `padding: 18px 22px 22px`, full viewport height.
- CSS grid, `grid-template-rows: auto 1fr` → a **top bar** then a **main** region that
  fills remaining height. The app does **not** page-scroll; individual panels scroll
  internally. `html, body { overflow: hidden }`.

**Top bar** (`.topbar`, flex, `gap: 22px`, bottom border `1px var(--line)`, 16px padding-bottom):
1. **Wordmark** (left): a cyan pixel "invader" sprite (26px) + the word **COINDROP** in the
   display font, `--fs-wordmark` (30px), with cyan glow text-shadow.
2. **Nav** (`.nav`): four tab buttons — `LOBBY · GAME · SCORES · HISTORY`. Mono, 700,
   `font-size: var(--fs-sm)`, `letter-spacing: 0.16em`, uppercase, `padding: 8px 14px`.
   Inactive: `color: var(--text-dim)`, transparent 2px bottom-border. Hover: `color: var(--text)`.
   Active: `color: var(--accent)`, 2px cyan bottom-border, cyan text glow.
3. **"Me" chip** (`.me-chip`, pushed right with `margin-left:auto`): pill (`border-radius:99px`,
   `1px var(--line)`, `bg var(--bg-1)`), 30px avatar + handle (mono 700, 13px) + record
   (`24W · 11L`, 10px, `var(--text-faint)`).

Below the top bar, **`main`** renders exactly one screen based on the active tab.

The CRT atmosphere is **three fixed full-screen overlay divs** (`.crt-vignette`,
`.crt-scanlines`, `.crt-grain`), `pointer-events:none`, high `z-index`. They sit above
everything and are driven by `--crt` (0–1). Keep these as three sibling divs at the end of
`<body>` (or in `+layout.svelte`). See **CRT Atmosphere** below.

---

## Screen 1 — Lobby (hero screen)

**Purpose:** the social heart. See who's here, chat, start a game.

**Layout** (`.lobby-grid`): CSS grid, full height, `gap: var(--gap)`:
`grid-template-columns: 290px minmax(0,1fr) 348px` → **left rail / roster / chat**.

Responsive:
- `≤1080px`: `grid-template-columns: 1fr 1fr`; the chat (last child) spans both columns.
- `≤720px`: single column, the grid scrolls; nav becomes horizontally scrollable.

### Left rail (290px) — two stacked panels
1. **Games panel** (`.panel`, `padding: var(--pad)`):
   - Eyebrow label "GAMES" (`.eyebrow`: mono 11px, `letter-spacing:0.32em`, uppercase, `var(--text-faint)`).
   - Three **game tiles** (`.game-tile`), vertical grid, `gap: var(--gap-sm)`:
     - Each: flex row, `padding: var(--pad-sm)`, `border-radius: var(--r-sm)`.
     - 48px sprite square (`bg var(--bg-3)`, inset cyan glow) + name (display, 14px,
       nowrap) + tag (eyebrow).
     - **Tic-Tac-Toe** tile: `live` — `bg var(--bg-2)`, `1px var(--accent-line)` border,
       cyan ▸ chevron at right, clickable. Hover: cyan border + glow + `translateY(-1px)`.
     - Two **"???" / "COMING SOON"** tiles: `opacity: 0.45`, `not-allowed`, `1px var(--line)`,
       no background. (Placeholder slots so the catalog reads as extensible.)
2. **Quick play panel** (`.panel`, `padding: var(--pad)`):
   - Eyebrow "QUICK PLAY".
   - One line of copy: "Drop a coin and we'll match you with anyone in the lobby."
     (12.5px, `var(--text-dim)`, line-height 1.5).
   - Primary button **"◎ PLAY RANDOM OPPONENT"** (`.btn .btn-accent .btn-block`, 13px,
     `letter-spacing:0.08em`).
   - A labelled divider: thin rule / "OR PICK SOMEONE →" eyebrow / thin rule.
   - Ghost button **"◎ SIMULATE INCOMING CHALLENGE"** (`.btn .btn-ghost .btn-block`, 11px).
     > This button exists only to demo the coin-drop in the prototype. In production,
     > incoming challenges arrive from the backend — **remove this button** and trigger
     > the modal from a real "challenge received" event.

### Center — Roster panel (`.panel`, flex column, internal scroll)
- **Panel head** (`.panel-head`): title `PLAYERS <b>N</b> ONLINE` (the count `N` is cyan,
  700) on the left; a **LiveDot** on the right (3 animated cyan equalizer bars + "LIVE"
  label, mono 700, 10px, `letter-spacing:0.22em`, cyan).
- **Scroll body** (`overflow-y:auto`, 8px padding): a list of **roster rows**.

**Roster row** (`.roster-row`, flex, `min-height: var(--row-h)` = 60px regular,
`padding: 0 var(--pad-sm)`, `border-radius: var(--r-sm)`; hover `bg var(--bg-2)`):
- **Avatar** (40px): pixel sprite in a cyan-edged tile + a **presence dot** at bottom-right
  (11px, 2px bg-colored ring): cyan glow = in lobby, amber glow = in game, faint = away.
- **Name + record**: handle (mono 700, 14px, `var(--text)`); below, `41W · 19L` (11px, `var(--text-faint)`).
- **StatusBadge** (see **Key element A**).
- **Challenge CTA** (`.btn .btn-ghost .roster-cta`, 11px, `padding:7px 12px`): label
  "CHALLENGE". **Hidden by default (`opacity:0`); revealed on row hover.** Disabled (stays
  hidden) when the player is in a game ("BUSY") or away. On touch devices (`hover:none`)
  it's always visible.
- Away players: whole row at `opacity: 0.6`.

### Right — Chat panel (`.panel`, flex column, internal scroll) — **must feel alive**
- **Panel head**: title `LOBBY <b>CHAT</b>`; right side eyebrow `#main-floor`.
- **Scroll body** (`overflow-y:auto`, `padding: var(--pad-sm)`, `gap:10px`): chat lines.
  **Auto-scrolls to bottom whenever messages change** (in React: `el.scrollTop = el.scrollHeight`
  in an effect on `messages`; in Svelte: `afterUpdate` or `tick().then(...)`).
- Two line types:
  - **Normal message**: 24px sprite chip (cyan; **amber if it's you**) + header
    (handle in `--accent-bright`, **amber + " (you)" if you**, mono 700 12px) + timestamp
    (10px faint) + body (12.5px, `var(--text)`, line-height 1.45, `word-break:break-word`).
  - **System message** (`who === "_system"`): centered, faint (11.5px `var(--text-faint)`),
    flanked by thin horizontal rules, with a small `◆` in `--accent-deep`. e.g.
    "TURBO_K challenged NOVA", "BYTE_ME joined the lobby".
- **Composer** (bottom, `border-top:1px var(--line)`, `padding: var(--pad-sm)`): text input
  (`bg var(--bg-3)`, `1px var(--line)`, focus → cyan border ring) + cyan **SEND** button.
  (Input is non-functional in the prototype; wire it to send on the backend.)

### Liveness (explicitly requested — make "people are here now" tangible)
Two signals are implemented and should be preserved:
1. **Pulsing presence dots** — every avatar's status dot emits a ping ring (cyan for lobby,
   faster amber for in-game). See `.presence` + `@keyframes ping`.
2. **Self-updating chat** — the room keeps talking. In the prototype a timer appends an
   ambient line every ~4.2s (`AMBIENT_CHAT`) and the panel auto-scrolls. In production this
   is real message traffic, but preserve the auto-scroll-to-latest behavior and the
   system-line style for presence/activity events.

---

## Screen 2 — Game

**Purpose:** play one game of tic-tac-toe. The board is the star.

**Layout:** CSS grid `grid-template-columns: 1fr auto 1fr`, vertically centered, full height,
`padding: 0 var(--pad)`. Three regions: **you (left) · board column (center) · opponent (right)**.

### Player cards (left = you/X, right = opponent/O)
`PlayerCard` — column, aligned to its outer edge (left card left-aligned, right card
right-aligned/`justify-self:end`, `max-width: 260px`):
- 64px sprite square (`bg var(--bg-3)`, `border-radius:var(--r)`). Border + glow turn cyan
  and intensify (`box-shadow: 0 0 22px -4px var(--accent-glow)`) **when it's that player's turn**.
- Handle (display, 19px, **nowrap**, " (you)" appended for you) + record below (11.5px faint).
- A small pill: the player's mark glyph (X cyan / O amber, 18px) + "PLAYS X" / "PLAYS O" eyebrow.

### Center column (flex, centered, `gap: var(--gap)`)
1. **Turn indicator** — see **Key element B**.
2. **Board** (`Board`): 3×3 CSS grid, `gap:10px`, `width: min(56vh, 440px)`, `aspect-ratio:1`.
   - Each cell (`.ttt-cell`): `bg var(--bg-2)`, `1px var(--line-strong)`, `border-radius:var(--r)`.
     Playable cells (your turn, empty) show cursor + hover (cyan border, `bg var(--accent-soft)`).
   - **Marks**: drawn as SVG, not glyphs. **X** = two cyan strokes (`stroke-width 13` on a
     100×100 viewBox, square caps), cyan drop-shadow. **O** = cyan… no — **O is amber**
     (`stroke-width 13`, `r 28`), amber drop-shadow. Mark size `min(16vh, 120px)`.
   - Each placed mark animates in via `@keyframes mark-in` (scale 0.2→1.15→1, 0.35s,
     cubic-bezier(.2,.8,.3,1.2)).
   - **Winning line**: the three winning cells get `bg var(--accent-soft)`, cyan border, and
     a strong cyan glow (`box-shadow: 0 0 24px -4px var(--accent-glow), inset ...`).
3. **End controls / hint** (fixed 56px tall row):
   - During play: eyebrow hint "best of one · winner takes the points".
   - On game end: **"↻ REMATCH"** (cyan, `btn-lg`) + **"← BACK TO LOBBY"** (ghost, `btn-lg`),
     entering with `@keyframes win-pop`.

### Win / draw end-states (the satisfying flourish)
- **You win**: turn indicator → "YOU WIN" (cyan); winning line glows cyan; **confetti**
  rains over the board (`Confetti` — 36 bits, colors cyan/bright-cyan/amber/white, each
  `@keyframes confetti-fall` falling 420px with rotation, randomized delay/duration/size).
- **You lose**: indicator → "<OPP> WINS" (red, `var(--danger)`); winning line still
  highlights (currently cyan — see open question in the chat; can be retinted red).
- **Draw**: indicator → "DRAW GAME" (`var(--text-dim)`), no confetti.

### Game logic (pure, port to `src/lib/ttt.js`)
- `winnerOf(board)` → `{mark, line}` or `null`. `board` is a length-9 array of `"" | "X" | "O"`.
  Wins checked against the 8 standard lines.
- `aiMove(board, ai="O", human="X")` → index. Priority: **win > block > center > random
  corner > any**. This is the single-player stand-in for a real opponent.
- Turn flow: human is **X** and moves first. After a human move, if no win/draw, it's the
  opponent's turn; the opponent replies after a `650–1150ms` delay (feels like a person
  thinking). Detect win/draw after every move.
> In production the opponent is another human over the network; keep the same board/turn
> state machine but replace `aiMove` + timer with received moves.

---

## Screen 3 — Leaderboard ("SCORES") — high-score cabinet

**Purpose:** ranked table by wins; reads like an arcade high-score board.

**Layout:** centered column, `width: min(760px, 100%)`, internal scroll.
- Header (centered): eyebrow "★ HALL OF FAME ★", then **HIGH SCORES** (display,
  `--fs-title` 34px, cyan glow).
- Table inside a `.panel`. Rows are CSS grid: `grid-template-columns: 54px minmax(0,1fr) 70px 70px 84px`,
  `align-items:center`, `gap:12px`, `padding: 11px var(--pad)`, bottom border `1px var(--line)`.
  - **Head row** (`.lb-head`): RANK · PLAYER · WINS · WIN % · RECORD (mono 700, 10px,
    `letter-spacing:0.18em`, faint, stronger bottom border).
  - **Data rows**, sorted by wins desc. Columns:
    - **Rank** (display, 18px, zero-padded `01`): #1 amber + amber glow; #2–3 bright-cyan +
      cyan glow; rest faint.
    - **Player**: 30px sprite chip + handle (mono 700, 14px); #1 also gets a 👑.
    - **Wins** (display, 17px), **Win %** (13px dim), **Record** `W-L` (12px faint), all right-aligned.
  - **Your row** (`.lb-me`): cyan-soft left-to-transparent gradient bg + `inset 2px 0 0 var(--accent)`
    left bar; handle in bright cyan with " (you)".
- Entrance: rows stagger in (`.stagger`, `@keyframes rise`, per-row `animation-delay`).

---

## Screen 4 — Match History

**Purpose:** the player's own recent games.

**Layout:** centered column, `width: min(680px, 100%)`, internal scroll.
- Header row (flex space-between, wraps): left — eyebrow "YOUR CABINET" + **MATCH HISTORY**
  (display, 34px, nowrap); right — three stats: **WINS** (cyan), **LOSSES** (red),
  **DRAWS** (dim), each a big number (display, 26px, colored glow) over an eyebrow label.
- A `.panel` list (8px padding, rows `gap:2px`), each **history row** (`.hist-row`, flex,
  `gap:14px`, `padding:12px var(--pad-sm)`; hover `bg var(--bg-2)`):
  - **Result chip** (`.result-chip`, mono 700 10px, min-width 52px, centered, 1px border):
    `result-win` cyan / `result-loss` red / `result-draw` dim — bg/border tinted to match.
  - "vs" (12px faint) + 28px opponent sprite chip + opponent handle (mono 700 14px).
  - "played <mark>" — the mark you played that game (X cyan / O amber, 15px).
  - Relative time, right-aligned (12px faint, e.g. "12m ago", "yesterday").
- Rows stagger in like the leaderboard.

---

## Transient moments (overlays)

### Key element C — Incoming challenge: the "COIN DROP" (`ChallengeModal`)
The most important micro-moment. Someone challenges you; it must feel like a coin dropping
into a slot.
- **Backdrop**: fixed full-screen, `rgba(2,5,8,0.78)`, fades in (`@keyframes backdrop-in`,
  0.25s). Click backdrop = decline.
- **Impact flash**: a full-screen cyan div flashes once on open (`@keyframes coin-flash`,
  opacity 0→0.9→0 over 0.5s) — the "drop" landing.
- **The card**: absolutely positioned, **drops from above with a bounce** —
  `@keyframes coin-drop` (0.75s, `cubic-bezier(.3,1.3,.5,1)`): starts above viewport,
  rotated on X (`rotateX(80deg)`) and small, lands with a slight overshoot/settle.
  `transform-origin: center top`.
  - Cyan-bordered panel, strong cyan outer glow + deep drop shadow.
  - Eyebrow "◎  COIN DROPPED  ◎" (cyan, `letter-spacing:0.34em`).
  - 84px challenger sprite tile, then their **handle** (display, 24px, cyan glow).
  - "wants to play **Tic-Tac-Toe**", then "<W>W · <L>L · auto-declines in **Ns**".
  - A **10-second countdown** that auto-declines at 0 (decrements once per second).
  - Buttons: **"✕ DECLINE"** (ghost + `.btn-danger` hover, `flex:1`) and
    **"▸ ACCEPT & PLAY"** (cyan, `flex:1.4`). Accept → start game vs challenger.
- Accessibility/reduced-motion: drops/flash should be gated so reduced-motion users still
  see the modal (skip the transform animation, keep it visible).

### Outgoing matchmaking (`Matchmaking`)
When **you** challenge someone (or Play Random): a small centered overlay panel, two phases:
1. **calling** (~1.4s): challenger sprite **pulses** (`@keyframes pulse-soft`), eyebrow
   "DROPPING COIN…", a CANCEL ghost button.
2. **accepted** (~0.8s): sprite does `win-pop`, eyebrow "✓ CHALLENGE ACCEPTED" (cyan),
   then transitions into the game.
> In production these phases are driven by the opponent's real accept/decline, not timers.

### Win flourish
Covered under **Screen 2** (confetti + cyan winning-line glow + "YOU WIN").

---

## Key UI elements (the three that carry the most product meaning)

### A — Status badge (`.badge`) — "in lobby" vs "in game"
Pill (`border-radius:99px`, 1px border), mono 700, 10px, `letter-spacing:0.16em`, uppercase,
with a leading **status dot** that emits a ping ring.
- **In lobby** (`.badge-lobby`): bright-cyan text, cyan-line border, `bg var(--accent-soft)`;
  cyan dot, **calm** ping (`@keyframes ping`, 2.4s).
- **In game** (`.badge-game`): **amber** text + amber-tinted border/bg; amber dot, **faster,
  more urgent** ping (1.3s). Label is `VS <opponent>` when known, else "IN GAME". This is the
  one place warm amber is allowed alongside cyan — it semantically means "occupied / playing".
- **Away** (`.badge-idle`): faint, no ping, "AWAY".

### B — Turn indicator (`TurnIndicator`)
A pill that broadcasts whose move it is.
- **Your turn**: cyan-line border + `bg var(--accent-soft)`; cyan dot pulsing
  (`@keyframes ping-solid`, 1.2s); label "YOUR TURN" (display, 17px, **nowrap**, cyan glow).
- **Opponent thinking**: neutral border/bg; amber dot pulsing; label "<OPP> IS THINKING" (amber).
- **End states**: "YOU WIN" (cyan) / "<OPP> WINS" (red) / "DRAW GAME" (dim); dot stops pulsing.

### C — Coin-drop challenge modal
See **Key element C** above. Treat the drop-bounce + impact flash as essential, not decorative.

---

## Design Tokens
All defined in `reference/arcade.css` `:root`. **Use these exact values.**

### Colors
| Token | Value | Use |
|---|---|---|
| `--bg` | `#05080b` | app background (deep blue-black) |
| `--bg-1` | `#0a0f14` | panels |
| `--bg-2` | `#0e151b` | elevated cards / board cells |
| `--bg-3` | `#14202a` | inputs / sprite tiles / hover |
| `--line` | `rgba(120,210,230,0.10)` | hairline borders |
| `--line-strong` | `rgba(120,210,230,0.24)` | stronger borders |
| `--accent` | `#2fe6ff` | **the one accent — electric cyan** |
| `--accent-bright` | `#8df6ff` | brighter cyan (hover, names) |
| `--accent-deep` | `#0c8fb3` | darker cyan (system ◆) |
| `--accent-glow` | `rgba(47,230,255,0.55)` | glows / shadows |
| `--accent-soft` | `rgba(47,230,255,0.12)` | tinted fills |
| `--accent-line` | `rgba(47,230,255,0.30)` | cyan borders |
| `--warm` | `#ffb13d` | **amber — ONLY for "in game" + O mark + win accents** |
| `--warm-glow` | `rgba(255,177,61,0.5)` | amber glow |
| `--danger` | `#ff5d6c` | loss / decline only |
| `--danger-glow` | `rgba(255,93,108,0.45)` | |
| `--text` | `#e4f5f9` | primary text |
| `--text-dim` | `#8ca4ab` | secondary |
| `--text-faint` | `#4f626a` | tertiary / metadata |
| `--text-on-accent` | `#02141a` | text on cyan buttons |

**Color discipline (important):** cyan is the dominant accent and carries ~everything.
Amber appears *only* for the "in game" status, the O mark, and win accents. Red appears
*only* for losses/declines. Do **not** spread color evenly or introduce new hues.

### Typography
- `--font-display: "Bungee"` (headings, scores, wordmark, marks-as-text, player names on game screen).
- `--font-mono: "Space Mono"` (all body, chat, names, UI, labels).
- Load from Google Fonts: `Bungee` and `Space Mono` (400/700, plus 400 italic). The
  prototype also loads `Press Start 2P`, `Monoton`, `Audiowide` — those were only options
  for the design-time font tweak; **production needs only Bungee + Space Mono.**

Type scale: `--fs-wordmark 30 · --fs-title 34 · --fs-score 40 · --fs-h 15 · --fs-body 14 ·
--fs-sm 12.5 · --fs-xs 11` (px). The recurring `.eyebrow` label = mono 11px,
`letter-spacing:0.32em`, uppercase, `var(--text-faint)`.

### Spacing / density
Defaults: `--pad 20 · --pad-sm 14 · --gap 14 · --gap-sm 9 · --row-h 60` (px). The prototype
ships compact/roomy overrides via `[data-density]` (a design tweak). For production, the
**regular** defaults are the spec; you may keep a density preference if desired but it's optional.

### Shape
`--r 6px · --r-sm 4px · --r-lg 10px`. The aesthetic favors **near-sharp corners** — keep radii small.

### CRT Atmosphere (`--crt`, default `0.7`)
Three fixed overlays, intensity scaled by `--crt`:
- `.crt-vignette` — radial edge-darkening (screen curvature), `mix-blend-mode:multiply`.
- `.crt-scanlines` — 3px repeating horizontal dark lines at `0.6 × --crt` opacity, plus a
  slow vertical glow "refresh sweep" (`@keyframes crt-sweep`, ~9s).
- `.crt-grain` — an inline SVG `feTurbulence` noise tile at `0.05 × --crt` opacity, jittering
  (`@keyframes grain-jitter`).
Production: pick a fixed intensity (0.7 recommended, matching the approved look) and set
`--crt` once. Keep the three overlay divs above app content, `pointer-events:none`.

### Motion
- Entrance: `.stagger > *` uses `@keyframes rise` (14px up + fade, 0.5s, `cubic-bezier(.2,.7,.2,1)`)
  with per-item `animation-delay`. Used on roster, leaderboard, history.
- All durations are divided by `--anim` (a design-time motion multiplier). For production,
  drop the `--anim` machinery and bake durations at `--anim:1` (the approved speed), OR keep a
  reduced-motion path.
- **Respect `prefers-reduced-motion`**: the CSS already disables pings, grain, sweep, and
  reveals; visible end-states must remain (never leave content stuck at `opacity:0`).
- Reserve big motion for the three high-impact moments: **staggered lobby reveal**, the
  **coin drop**, and the **win flourish**. Avoid scattering micro-interactions everywhere.

Full keyframe list in `arcade.css`: `crt-sweep, grain-jitter, ping, ping-solid, pulse-soft,
eq, coin-drop, coin-flash, backdrop-in, win-pop, win-line, confetti-fall, mark-in, cell-flash,
rise, fade`.

---

## State / Realtime (production guidance)
The prototype holds everything in component state and fakes the network. Real app needs:

- **Presence**: list of players with `{id, name, sprite, status: "lobby"|"game"|"idle",
  wins, losses, vs?}`. Drives the roster, presence dots, online count. Subscribe to a
  presence channel; update reactively.
- **Chat**: append-only message stream `{who, sprite, me?, text, t}` plus system events
  `{who:"_system", text, t}` for joins/challenges/results. Auto-scroll to newest.
- **Challenge protocol**: emit "challenge(targetId)"; receive "challenged(by)" → show coin-drop
  modal; accept/decline/timeout (10s) round-trip; on mutual accept → enter game.
- **Game session**: shared board state, turn ownership, move submission, win/draw resolution,
  rematch. Keep the `winnerOf` logic client-side for instant feedback but the server is
  authoritative. Replace `aiMove` entirely (it's a single-player placeholder).
- **Leaderboard / history**: queried from backend; same row shapes as the mock data in `data.jsx`.

Sprite identity: each player has a `sprite` key from the set in `sprites.jsx`
(`invader, squid, ghost, ship, robot, skull, cat, ufo, bug, alienb, heart, rocket`).
Persist a sprite per account. Sprites are pure SVG (pixel grids); identity comes from shape,
all rendered in `currentColor` (cyan) to preserve the single-accent discipline.

---

## Assets
- **No external image assets.** All iconography is inline SVG: pixel sprites (`sprites.jsx`)
  and the X/O marks. The grain texture is an inline SVG data-URI in the CSS.
- **Fonts**: Google Fonts — **Bungee** + **Space Mono** (the rest are prototype-only).
- **Emoji** used sparingly and intentionally: 👑 (leaderboard #1), 😤 (one seeded chat line).
  Keep or drop per your content guidelines; they are not load-bearing.

---

## Screenshots (in `screenshots/`)
`1-lobby.png` · `2-game.png` · `3-scores.png` · `4-history.png` · `5-coindrop.png` — high-fidelity captures of each screen and the coin-drop moment, at the approved 70% CRT intensity.

## Files (in `reference/`)
| File | Contents |
|---|---|
| `Arcade.html` | Entry; loads fonts, `arcade.css`, React/Babel, and all component scripts. |
| `arcade.css` | **The full design system** — tokens, components, CRT overlays, keyframes. Portable as-is. |
| `app.jsx` | Shell, tab nav, all top-level state, accent-derivation helper, tweak wiring. |
| `lobby.jsx` | `Lobby, GamesCatalog, Roster, RosterRow, Chat, ChatLine`. |
| `game.jsx` | `GameScreen, Board, TurnIndicator, Confetti, PlayerCard`, `winnerOf`, `aiMove`, `LINES`. |
| `boards.jsx` | `Leaderboard, MatchHistory, Stat`. |
| `challenge.jsx` | `ChallengeModal` (coin drop), `Matchmaking`. |
| `ui.jsx` | `Wordmark, Avatar, StatusBadge, SectionLabel, LiveDot`. |
| `sprites.jsx` | `PixelSprite` (+ `SPRITES` pixel maps), `MarkX`, `MarkO`. |
| `data.jsx` | Mock `ME, PLAYERS, SEED_CHAT, AMBIENT_CHAT, HISTORY` — replace with backend data. |
| `tweaks-panel.jsx` | Design-exploration tweak panel — **do not port to production.** |

To view the reference: open `reference/Arcade.html` in a browser. Use the tabs to move
between screens; the coin-drop fires automatically ~8s after load, or via the "Simulate
incoming challenge" button.
