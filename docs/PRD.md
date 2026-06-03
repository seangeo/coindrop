# PRD — Arcade (Supabase Realtime learning build)

## 1. Purpose & intent

A small multiplayer "arcade" web app whose **real goal is to exercise as much of Supabase Realtime as possible** — Presence, Broadcast, and Postgres Changes — plus the Realtime authorization model (RLS over `realtime.messages`) and database-resident game logic (RPC + RLS).

Tic-tac-toe is the game, but it is **deliberately an excuse**. The game is trivial and drawn under perfect play; the interesting product is the **social/arcade layer** around it (who's online, challenges, chat, leaderboard, history). The triviality of each match is a feature: it makes the social layer and the over-many-games leaderboard the point.

This is a **learning build**, weekend-sized. Scope discipline matters more than completeness. Where a feature balloons, the minimal version wins.

### Non-goals
- Not a production product; not intended to become a business.
- No spectator/live-watch mode (same primitive as playing — adds no new Realtime coverage).
- No live replay feature (it's a historical read, not a Realtime feature). But see §5: moves are stored as an append-only sequence so replay stays *possible* later for free.
- No real action-game netcode (no prediction/interpolation). Turn-based only.

## 2. Architecture stance

- **Client-side first.** Supabase is the backend-as-a-service: the browser client talks directly to PostgREST (DB), the Realtime server, and Auth. There is **no custom backend server**.
- **The "backend" lives in Postgres:** RLS policies are the authorization layer; a `make_move` Postgres function (RPC) is the trusted, server-side game referee.
- **Authorization is the security model.** RLS on tables + RLS over `realtime.messages` for channel authorization. This is treated as a first-class design surface, not an afterthought.

## 3. Division of labour (important)

- **The human (Sean) owns everything that touches Supabase:** the data model (schema), all RLS policies, the `make_move` RPC, the Supabase client setup, all Realtime subscriptions, RPC calls, and queries. Built by hand to feel the Supabase dev experience.
- **An agent owns the front-end:** SvelteKit scaffolding, routing, components, layout, styling, local UI state, and a set of **typed stub modules** the UI depends on. The agent must **not** write any Supabase integration code or define the data model. See CLAUDE.md for the hard boundary.
- The seam between the two is the stub contract (see CLAUDE.md §"The stub seam").

## 4. Tech stack

- **Frontend:** SvelteKit in static-SPA mode (`ssr = false`, static adapter), Vite, TypeScript. Chosen for light weight and because wrapping a Realtime channel in a Svelte store maps cleanly to Realtime's reactive-state nature.
- **Backend:** Supabase — Postgres, Realtime, Auth, RLS, Postgres functions (RPC).
- **Note on keys (mid-transition as of 2026):** prefer the new publishable (`sb_publishable_…`) / secret (`sb_secret_…`) keys over legacy anon/service_role. Verify current setup against Supabase docs at build time.

## 5. Core domain model decisions (locked)

These are decided; the human implements them in Supabase.

- **Event-sourced game state.** Game state is an append-only sequence of move events, not a mutable board column. Current board is *derived* by folding the move log (≤9 moves — derivation is free at this scale; no cached projection).
- **The move sequence number is the turn-race guard.** A move asserts "I am move N"; a unique constraint on `(match_id, seq)` means two simultaneous writes can't both claim N — one wins, the other gets a constraint violation and retries by re-reading.
- **Two distinct validation checks, both required, both in the RPC:**
  1. *Turn-race guard* (seq uniqueness) — stops concurrent double-writes.
  2. *Legality check* (fold the moves: cell empty, it's actually this player's turn) — stops illegal/out-of-turn moves.
- **`make_move` RPC is the spine.** One atomic transaction: validate turn via seq, validate legality via derived board, append move, check terminal state (8 winning lines + draw), and on game end settle results (match status + leaderboard tally).
- **Challenge and random-match are one unified flow.** A single match-request concept with an optional target: directed challenge sets a target user; random match leaves it null and joins a pool. Same accept path → creates a persistent match. Random match adds exactly one thing: claiming a waiting request without two players grabbing it at once (same locking lesson as turn-races).
- **Chat is persisted** (write to a table, delivered live via Postgres Changes). Broadcast is already exercised by the challenge mechanism, so chat deliberately exercises the *persisted* live path.
- **Directed messages use per-user channels** with RLS over `realtime.messages` — you can only listen to your own. This is the centerpiece authorization lesson; intentionally chosen over global-channel + client-side filtering.

## 6. Realtime feature coverage (the actual point)

| Primitive | Carries |
|---|---|
| **Presence** | Arcade roster + per-player status (in lobby / in game) as Presence metadata |
| **Broadcast** | Challenges and match invites — ephemeral, directed |
| **Postgres Changes** | Game moves, chat messages, leaderboard, match results |
| **Authorization** | Per-user channels for directed challenges (RLS over `realtime.messages`); table RLS for who can read/write matches and messages |

## 7. User stories

1. As a new user I want to **enter the arcade** so I can join the fun.
2. As a user I want to **see who else is in the arcade**.
3. As a user I want to **see what games are available** (just tic-tac-toe, but modelled as data so "more games" stays cheap).
4. As a user I want to **challenge someone** to a game of tic-tac-toe.
5. As a user I want to **play a random player** in the lobby.
6. As a user I want to **see the results of all my previous games**.
7. As a user I want to **challenge someone to a rematch** (reuses the challenge flow with a pre-filled opponent).
8. As a user I want to **see the leaderboard**.
9. As a user I want to **chat with other players** in the arcade.

## 8. Screens / routes

- `/` — arcade lobby: roster (with status badges), games catalog, chat panel, challenge / join-random controls, incoming-challenge modal.
- `/game/[matchId]` — the board: derived state, whose-turn indicator, move interaction, rematch control on game end.
- `/leaderboard` — live leaderboard table.
- `/history` — my previous games (a historical read; not Realtime).
- Layout — nav + player identity/status slot.

## 9. Acceptance (learning-oriented, not exhaustive)

The build "succeeds" when:
- All three Realtime primitives are exercised against live Supabase data.
- Directed challenges work over per-user channels gated by RLS (you cannot receive someone else's challenge).
- `make_move` rejects both out-of-turn moves (legality) and concurrent double-writes (seq guard), demonstrably.
- A completed game atomically updates match status and the leaderboard.
- Chat history survives a refresh (persisted), while challenges do not (ephemeral) — the contrast is observable.
- The move log alone reconstructs any finished game (replay stays possible).

## 10. Explicitly deferred / cut
- Spectator / live-watch.
- Replay UI (data model supports it; feature not built).
- Auto-match queue polish beyond a single shared pool claim.
- Multiple games (catalog is data-modelled but only tic-tac-toe exists).
