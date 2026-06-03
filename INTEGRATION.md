# INTEGRATION.md — wiring COINDROP to Supabase

This front-end is complete against **mocks**. All data access is isolated behind the
stub modules in `src/lib/supabase/`. The UI imports **only** from those modules — never
from Supabase directly. Your job is to replace each mock body with real Supabase calls,
matching (or adjusting) the mock data shapes. You own the schema; these shapes are just
what the UI currently consumes.

Every stub function `console.log`s its call and mutates local mock state so the app feels
live. Each file has a `// TODO(sean)` block with the intended Supabase mapping. The mock
data shapes are defined in **`src/lib/supabase/types.ts`**.

## The boundary (keep it intact)

The tokens `createClient`, `.channel(`, `.from(`, `.rpc(`, `.subscribe(`, `supabase-js`
currently appear **only** inside `src/lib/supabase/` and only inside `// TODO` comments.
When you wire the real thing, keep all Supabase usage inside this directory. The UI layer
(`src/routes`, `src/lib/components`) should keep importing from the stubs.

Self-check (should list nothing outside the seam):

```bash
grep -rnE 'createClient|\.channel\(|\.from\(|\.rpc\(|\.subscribe\(|supabase-js' src/ \
  | grep -v 'src/lib/supabase/'
```

## Realtime coverage map (PRD §6)

| Primitive | Carries | Stub module(s) |
|---|---|---|
| **Presence** | Roster + per-player status (lobby / in game) | `presence.ts` |
| **Broadcast** | Challenges / invites (ephemeral, directed, per-user channel) | `challenges.ts` |
| **Postgres Changes** | Moves, chat, leaderboard, match results | `match.ts`, `chat.ts`, `leaderboard.ts` |
| **Authorization** | Per-user challenge channel (RLS over `realtime.messages`); table RLS | `challenges.ts`, all queries |
| **RPC (referee)** | `make_move` — validate turn + legality, append, settle | `match.ts` |

---

## Modules

### `client.ts`
- **Exports:** `supabase` (currently `unknown` = `null` placeholder).
- **Implement:** create the real client — `createClient(PROJECT_URL, PUBLISHABLE_KEY)`.
  Prefer the new `sb_publishable_…` key over the legacy anon key (PRD §4). Other stub
  modules already `import { supabase } from './client'`-ready.

### `auth.ts` — identity + entering the arcade
- **Exports:** `currentUser: Writable<Player | null>` (null ⇒ entry guard redirects to
  `/enter`), `enterArcade(handle, sprite)`, `signOut()`.
- **Mock shape:** `Player = { id, name, sprite, wins, losses }`.
- **Implement:** `enterArcade` → `supabase.auth.signInAnonymously({ options: { data: { handle, sprite } } })`.
  Anonymous users get a real JWT with `is_anonymous: true` and use the `authenticated`
  Postgres role, so your `to authenticated` RLS covers them. Derive `currentUser` from the
  session (handle/sprite from `user_metadata`; wins/losses from a `profiles` row or a
  leaderboard query). Subscribe to `supabase.auth.onAuthStateChange` to keep `currentUser`
  in sync — Supabase persists the session itself, so **delete the localStorage mock**.
  `signOut()` → `supabase.auth.signOut()`. Optionally upgrade anon → permanent later via
  `linkIdentity({provider})` or `updateUser({email})`.

### `presence.ts` — the lobby roster (PRESENCE)
- **Exports:** `arcadeRoster: Writable<RosterPlayer[]>`, `rosterState: Writable<LoadState>`,
  `joinArcade()`, `leaveArcade()`.
- **Mock shape:** `RosterPlayer = Player & { status: 'lobby' | 'in_game' | 'away'; vs?: string }`.
  > Note: CLAUDE.md listed `'lobby' | 'in_game'`; `'away'` was added to render the design's
  > three presence states. Maps to CSS suffixes lobby→lobby, in_game→game, away→idle.
- **Implement:** a Realtime **presence** channel. On `presence` `sync`, rebuild the roster
  from `channel.presenceState()`. `joinArcade()` → `channel.track({ status, sprite, ... })`
  after `SUBSCRIBED`; `leaveArcade()` → `untrack` / `removeChannel`. Set status to
  `'in_game'` (+ `vs`) when a match starts. Drive `rosterState` off the subscribe lifecycle.

### `challenges.ts` — challenges + random match (BROADCAST + RLS)
- **Exports:** `incomingChallenge: Writable<IncomingChallenge | null>`,
  `sendChallenge(targetUserId)`, `joinRandomQueue()`, `acceptChallenge(id)`,
  `declineChallenge(id)`, and **`simulateIncomingChallenge()`** (DEV-ONLY demo trigger).
- **Mock shape:** `IncomingChallenge = { id, from: Player, game }`. Ephemeral — no history.
- **Implement:** listen on a **per-user channel** (e.g. `user:${myId}`) for a `challenge`
  broadcast → set `incomingChallenge`. **RLS over `realtime.messages` must ensure you can
  only subscribe to your own channel** (the centerpiece authorization lesson). `sendChallenge`
  broadcasts to `user:${targetUserId}`. `joinRandomQueue` inserts/claims a match-request with
  a null target from a shared pool (lock so two players can't grab one). `acceptChallenge`
  creates the match (see `match.ts`) and broadcasts acceptance back. **Delete
  `simulateIncomingChallenge` and its lobby button** once Broadcast is real.

### `match.ts` — a single game (POSTGRES CHANGES + `make_move` RPC)
- **Exports:** `match(matchId): Readable<MatchState | null>`, `makeMove(matchId, cell)`,
  `requestRematch(matchId)`, `createMatch(opponent, mark)`, `activeMatchId: Writable<string|null>`.
- **Mock shape:** event-sourced — an append-only `MoveEvent[]` (`{ seq, player, cell }`)
  folded into `MatchState = { board, whoseTurn, status: 'active'|'won'|'drawn', winner,
  winningLine, you, opponent, yourMark }`. The fold lives in this file (keep it!).
- **Implement (PRD §5, locked):**
  - `createMatch` / accept → INSERT a row into your `matches` table (RLS-guarded query or RPC).
  - `match(matchId)` → subscribe to `postgres_changes` on the moves table filtered by
    `match_id`; **fold the move rows into a board client-side** (reuse `src/lib/ttt.ts`).
  - `makeMove` → `await supabase.rpc('make_move', { match_id, cell })`. The RPC is the
    authoritative referee: validates turn (seq uniqueness), validates legality (fold), appends,
    checks terminal state (8 lines + draw), and settles match status + leaderboard on game end.
  - **Delete the local `aiMove` opponent reply** — real moves arrive over Realtime.
- `src/lib/ttt.ts` (`winnerOf`, `aiMove`, `LINES`) is pure and lives outside the seam on
  purpose. Keep `winnerOf` for instant client feedback; drop `aiMove` (single-player stand-in).

### `chat.ts` — lobby chat (POSTGRES CHANGES, persisted)
- **Exports:** `messages: Writable<ChatMessage[]>`, `chatState: Writable<LoadState>`,
  `sendMessage(text)`.
- **Mock shape:** `ChatMessage = { who, sprite?, me?, text, t }`; `who === '_system'` renders
  as a centered activity divider. Chat is **persisted** (survives refresh) — the contrast with
  ephemeral challenges is intentional (PRD §5).
- **Implement:** on load `SELECT` recent rows → seed `messages`; subscribe to
  `postgres_changes` (INSERT) to append live. `sendMessage` → INSERT a row (RLS controls who
  can post); reconcile or drop the optimistic append once the realtime echo arrives.
  **Delete the ambient-line timer** (mock liveness only).

### `leaderboard.ts` — high scores (POSTGRES CHANGES)
- **Exports:** `leaderboard: Readable<LeaderboardEntry[]>` (sorted by wins desc, current
  player flagged `you`), `leaderboardState: Writable<LoadState>`.
- **Implement:** `SELECT` players/profiles ordered by wins (or a view); subscribe to
  `postgres_changes` for live updates as games settle. Flag the row matching `auth.uid()`.
  Optionally gate anonymous users with the `is_anonymous` JWT claim in RLS.

### `history.ts` — my past games (historical read, not Realtime)
- **Exports:** `matchHistory: Writable<HistoryEntry[]>`, `historyState: Writable<LoadState>`.
- **Mock shape:** `HistoryEntry = { opp, oppSprite, result, mark, when }`.
- **Implement:** `SELECT` the current player's finished matches ordered by `ended_at desc`,
  joining opponent handle/sprite and computing result + which mark you played. Compute relative
  `when` from the timestamp. No subscription needed. (Move log stays append-only so replay
  remains possible later — PRD §10 — but no replay UI is built.)

---

## Routes (for orientation)

- `/enter` — handle + sprite picker → `enterArcade`. The root layout guards all routes:
  null `currentUser` ⇒ `/enter`; entered ⇒ app.
- `/` — lobby (roster, games, chat, quick-play, incoming-challenge modal).
- `/game/[matchId]` — board, turn indicator, win/draw end-state, rematch.
- `/leaderboard` — high scores. `/history` — your games.

Every data-backed view has explicit **loading / empty / error** states driven by the
`*State` stores — keep these when wiring real async loads.

## Running it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # static-SPA build → ./build (adapter-static, SPA fallback)
npm run check      # svelte-check (types)
```

Static-SPA: `ssr = false`, `prerender = false` (`src/routes/+layout.ts`); adapter-static with
`fallback: 'index.html'` so client-side routing handles `/game/[matchId]`. No SSR, no server
routes, no server-side data loading — everything runs in the browser, where your Supabase
client will live.
