/* leaderboard.ts — the high-score board (ranked by wins).
 *
 * MOCK SHAPE:
 *   leaderboard: LeaderboardEntry[]  (Player + you?; sorted by wins desc)
 *   leaderboardState: 'loading' | 'ready' | 'error'
 *
 * Realtime primitive (PRD §6): POSTGRES CHANGES — the leaderboard is updated live
 * as games settle (the make_move RPC tallies wins on game end).
 *
 * TODO(sean): replace with a real query + live updates:
 *   - SELECT players/profiles ordered by wins (or a leaderboard view).
 *   - Subscribe to postgres_changes so the table updates live as results settle.
 *   The current player's row should be flagged (you: true) — match on auth.uid().
 *   Optionally gate anonymous users out with the is_anonymous JWT claim in RLS.
 */

import { writable, derived, type Readable } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUser } from './auth';
import type { LeaderboardEntry, LoadState, Player } from './types';

// Same population as the roster, without presence status.
const BASE: Player[] = [
	{ id: 'p1', name: 'NEONFOX', sprite: 'invader', wins: 41, losses: 19 },
	{ id: 'p2', name: 'GLITCH', sprite: 'squid', wins: 38, losses: 22 },
	{ id: 'p3', name: 'PIX3L', sprite: 'ghost', wins: 33, losses: 25 },
	{ id: 'p4', name: 'SOL_77', sprite: 'ufo', wins: 52, losses: 14 },
	{ id: 'p5', name: 'MAXOUT', sprite: 'robot', wins: 29, losses: 30 },
	{ id: 'p6', name: 'VECTOR', sprite: 'alienb', wins: 18, losses: 12 },
	{ id: 'p7', name: 'TURBO_K', sprite: 'rocket', wins: 47, losses: 20 },
	{ id: 'p8', name: 'NOVA', sprite: 'skull', wins: 44, losses: 21 },
	{ id: 'p9', name: 'ECHO', sprite: 'cat', wins: 12, losses: 9 },
	{ id: 'p10', name: 'BYTE_ME', sprite: 'bug', wins: 8, losses: 15 },
	{ id: 'p11', name: 'ZAPDOS', sprite: 'heart', wins: 21, losses: 17 },
	{ id: 'p12', name: 'ORBITAL', sprite: 'invader', wins: 5, losses: 11 }
];

export const leaderboardState = writable<LoadState>('loading');

// Sorted by wins desc, with the current player merged in and flagged.
export const leaderboard: Readable<LeaderboardEntry[]> = derived(currentUser, ($me) => {
	const rows: LeaderboardEntry[] = BASE.map((p) => ({ ...p }));
	if ($me) rows.push({ ...$me, you: true });
	return rows.sort((a, b) => b.wins - a.wins);
});

if (browser) {
	setTimeout(() => leaderboardState.set('ready'), 450);
}
