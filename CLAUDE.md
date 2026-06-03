# CLAUDE.md — Arcade front-end

You are building the **front-end only** for "Arcade," a small SvelteKit app. A human is hand-building all Supabase integration and the entire data model. Your job is the UI and the stub seam between them. Read this whole file before writing code.

## The single most important rule

**Do not write any Supabase code. Do not define the data model.**

You must NOT:
- Import or configure `@supabase/supabase-js` (or any Supabase package) anywhere outside the designated stub files (and even there, only as a TODO placeholder — see below).
- Write Realtime subscriptions, channels, Broadcast/Presence code, RPC calls, queries, or auth logic.
- Write any SQL, schema, table definitions, RLS policies, or Postgres functions.
- Guess at the database shape or "helpfully" wire up real data access.

If you are ever unsure whether something crosses this boundary: **leave a stub and a `// TODO(sean)` comment. Do not guess.** Eagerly wiring up real Supabase calls is the single most common way an agent ruins this setup. Resist it.

## Why the boundary exists

This is a learning project. The human is here to learn Supabase Realtime, RLS, and database-resident logic by hand. Your contribution is to remove the *boilerplate* (Svelte scaffolding, routing, components, styling, local state) so their attention goes entirely to the integration points. If you cross the boundary, you defeat the purpose of the exercise.

## Tech stack (do not deviate)

- SvelteKit, **static-SPA mode**: static adapter, `export const ssr = false`. No SSR, no server routes, no server-side data loading.
- Vite, TypeScript throughout.
- Styling: clean, minimal, your choice. Not the focus — don't over-invest. (A separate Claude Design pass may supply visual direction; keep components easy to restyle.)
- No state libraries beyond Svelte stores. No data-fetching libraries.

## The stub seam (this is the contract between you and the human)

All data access lives behind stub modules in `src/lib/supabase/`. **The UI imports ONLY from these modules — never from Supabase directly.** You implement these stubs with **mock data and mocked behaviour** so the app runs and looks complete end-to-end. The human later replaces the mock bodies with real Supabase calls.

Create these modules, each exporting the listed signatures with mocked bodies (return fake data, log calls, update local mock state so interactions feel live). At the top of each file, write a comment describing the data shape you're mocking so the human can match it when wiring the real source. **You may invent the mock shapes** — the human owns the real schema and will reconcile.

- `client.ts` — placeholder `supabase` export, typed, `// TODO(sean): real client`.
- `auth.ts` — `currentUser` store; `enterArcade()`, `signOut()`.
- `presence.ts` — `arcadeRoster` store (players + status: `'lobby' | 'in_game'`); `joinArcade()`, `leaveArcade()`.
- `challenges.ts` — `incomingChallenge` store; `sendChallenge(targetUserId)`, `joinRandomQueue()`, `acceptChallenge(id)`, `declineChallenge(id)`.
- `match.ts` — `match(matchId)` store exposing **derived** board + status + whose-turn (mock the derivation); `makeMove(matchId, cell)`, `requestRematch(matchId)`.
- `chat.ts` — `messages` store; `sendMessage(text)`.
- `leaderboard.ts` — `leaderboard` store.
- `history.ts` — `matchHistory` store.

Every stub function should log its call and mutate local mock state so the UI behaves as if live. Every store should ship realistic, fully-populated mock data so no screen looks empty.

## Domain facts you need (so the UI renders the right shapes)

You don't implement these, but the UI must reflect them:

- **Game:** tic-tac-toe, 3×3, two players (X and O), turn-based. A match ends in win or draw.
- **Board is derived from a move sequence**, not a flat board field. The `match` store should expose a ready-to-render board plus `whoseTurn`, `status` (`'active' | 'won' | 'drawn'`), and `winner`. Mock the fold; the human implements the real derivation.
- **Statuses on the roster:** a player is `lobby` or `in_game`. Show this as a badge.
- **Challenge vs random match are one flow** from the user's view: "challenge [player]" targets someone; "play random" joins a queue. Both resolve into a match the user gets dropped into. Model the incoming-challenge as a modal/toast with accept/decline.
- **Chat is persistent** (history shows on load); **challenges are ephemeral** (no history). Render accordingly — chat panel has scrollback, challenges are transient notifications.
- **Games catalog is data**, even though only tic-tac-toe exists. Render it as a list/grid so "more games" is a data change, not a UI rewrite.

## Routes to build

- `/` — arcade lobby: roster with status badges, games catalog, chat panel with scrollback, challenge + play-random controls, incoming-challenge modal/toast.
- `/game/[matchId]` — the board view: derived board, whose-turn indicator, click-to-move, win/draw end state, rematch button on game end.
- `/leaderboard` — leaderboard table.
- `/history` — my previous games list.
- `+layout` — nav across the four screens + a slot showing current player identity/status.

For every data-backed view, build explicit **loading, empty, and error** states. Where a mutation is natural to show optimistically (sending a chat message, making a move), render the optimistic affordance — but the actual mutation is just the stub call.

## Deliverables

1. A running SvelteKit static-SPA where **every screen looks and behaves complete against mocks**.
2. Every Supabase touchpoint isolated in `src/lib/supabase/` as a clearly-marked stub.
3. An `INTEGRATION.md` listing each stub module, its exported signatures, the mock data shape you used, and what the human needs to implement to make it real.

## Self-check before you finish

Grep your own output. These tokens must appear **only** inside `src/lib/supabase/` and only as TODO placeholders, never as working calls:
`createClient`, `.channel(`, `.from(`, `.rpc(`, `.subscribe(`, `supabase-js`.
If any appear as real working integration, you've crossed the boundary — revert it to a stub.
