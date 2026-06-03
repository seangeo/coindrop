/* match.ts — a single game's live state, derived from an append-only move log.
 *
 * MOCK SHAPE (per match):
 *   internal move log: MoveEvent[]  ({ seq, player: 'me'|'opponent', cell })
 *   match(matchId): Readable<MatchState | null>  — DERIVED board + whoseTurn +
 *     status ('active'|'won'|'drawn') + winner + winningLine, folded from the log.
 *   makeMove(matchId, cell)     — append your move, re-fold; mock opponent replies
 *   requestRematch(matchId)     — clear the log, play again
 *   createMatch(opponent, mark) — start a new match (called by challenges.ts)
 *
 * Domain (PRD §5, locked): game state is an append-only sequence of move events,
 * not a mutable board. The board is DERIVED by folding the log (≤9 moves). The
 * real referee is the `make_move` RPC; here the fold + a local AI stand in.
 *
 * Realtime primitive (PRD §6): POSTGRES CHANGES carry moves (+ match results).
 *
 * TODO(sean): replace the mock with the real thing:
 *   - createMatch / accept → INSERT into your matches table (via RLS-guarded query
 *     or an RPC); the matchId is the row id.
 *   - match(matchId): subscribe to postgres_changes on the moves table filtered by
 *     match_id, fold the rows into a board client-side (keep this fold!).
 *   - makeMove(matchId, cell): await supabase.rpc('make_move', { match_id, cell }).
 *     The RPC is authoritative — it validates the turn (seq uniqueness) and
 *     legality, appends the move, checks terminal state, and settles results.
 *     DELETE the local `aiMove` opponent reply entirely — moves arrive over Realtime.
 */

import { writable, derived, get, type Readable } from 'svelte/store';
import { currentUser } from './auth';
import { aiMove, winnerOf, isFull, type Board, type Mark } from '$lib/ttt';
import type { MatchState, MoveEvent, Player } from './types';

/** The match the GAME nav tab points at (most recently entered), or null. */
export const activeMatchId = writable<string | null>(null);

interface MatchRecord {
	opponent: Player;
	yourMark: Mark; // mock: you are always X and move first
	moves: ReturnType<typeof writable<MoveEvent[]>>;
}

const matches = new Map<string, MatchRecord>();
// Re-export a readable per match so components can subscribe with $.
const derivedCache = new Map<string, Readable<MatchState | null>>();

// Fallback identities so a deep-linked /game/<anything> still renders.
const FALLBACK_OPP: Player = { id: 'p5', name: 'MAXOUT', sprite: 'robot', wins: 29, losses: 30 };
const FALLBACK_YOU: Player = { id: 'me', name: 'PLAYER', sprite: 'ship', wins: 24, losses: 11 };

function you(): Player {
	return get(currentUser) ?? FALLBACK_YOU;
}

let counter = 0;
function newId(): string {
	counter += 1;
	return `m${Date.now().toString(36)}${counter}`;
}

/** Start a new match against `opponent`. Returns the matchId. */
export function createMatch(opponent: Player, yourMark: Mark = 'X'): string {
	const id = newId();
	matches.set(id, { opponent, yourMark, moves: writable<MoveEvent[]>([]) });
	activeMatchId.set(id);
	console.log('[match] createMatch', { id, opponent: opponent.name, yourMark });
	return id;
}

function ensureMatch(matchId: string): MatchRecord {
	let rec = matches.get(matchId);
	if (!rec) {
		// Deep-link / refresh into an unknown match: spin up a mock one.
		rec = { opponent: FALLBACK_OPP, yourMark: 'X', moves: writable<MoveEvent[]>([]) };
		matches.set(matchId, rec);
		activeMatchId.set(matchId);
		console.log('[match] ensureMatch (mock, unknown id)', matchId);
	}
	return rec;
}

function fold(matchId: string, rec: MatchRecord, moves: MoveEvent[]): MatchState {
	const oppMark: Mark = rec.yourMark === 'X' ? 'O' : 'X';
	const board: Board = Array(9).fill('');
	for (const mv of moves) {
		board[mv.cell] = mv.player === 'me' ? rec.yourMark : oppMark;
	}
	const w = winnerOf(board);
	let status: MatchState['status'] = 'active';
	let winner: MatchState['winner'] = null;
	let winningLine: MatchState['winningLine'] = null;
	if (w) {
		status = 'won';
		winner = w.mark === rec.yourMark ? 'me' : 'opponent';
		winningLine = w.line;
	} else if (isFull(board)) {
		status = 'drawn';
	}
	// You move first (seq 0); turns alternate.
	const whoseTurn: 'me' | 'opponent' = moves.length % 2 === 0 ? 'me' : 'opponent';
	return {
		matchId,
		board,
		whoseTurn,
		status,
		winner,
		winningLine,
		you: you(),
		opponent: rec.opponent,
		yourMark: rec.yourMark
	};
}

/** Reactive, derived view of a match (board + status + whose turn). */
export function match(matchId: string): Readable<MatchState | null> {
	const cached = derivedCache.get(matchId);
	if (cached) return cached;
	const rec = ensureMatch(matchId);
	const store = derived(rec.moves, (moves) => fold(matchId, rec, moves));
	derivedCache.set(matchId, store);
	return store;
}

/** Append the local player's move; the mocked opponent then replies. */
export async function makeMove(matchId: string, cell: number): Promise<void> {
	const rec = ensureMatch(matchId);
	const moves = get(rec.moves);
	const state = fold(matchId, rec, moves);
	if (state.status !== 'active' || state.whoseTurn !== 'me' || state.board[cell] !== '') {
		console.log('[match] makeMove ignored', { matchId, cell });
		return;
	}
	console.log('[match] makeMove', { matchId, cell });
	const afterYou = [...moves, { seq: moves.length, player: 'me' as const, cell }];
	rec.moves.set(afterYou);

	// MOCK opponent reply (delete when real moves arrive over Realtime).
	const next = fold(matchId, rec, afterYou);
	if (next.status !== 'active') return;
	const delay = 650 + Math.random() * 500;
	setTimeout(() => {
		const cur = get(rec.moves);
		const curState = fold(matchId, rec, cur);
		if (curState.status !== 'active' || curState.whoseTurn !== 'opponent') return;
		const aiCell = aiMove(curState.board, rec.yourMark === 'X' ? 'O' : 'X', rec.yourMark);
		if (aiCell < 0) return;
		rec.moves.set([...cur, { seq: cur.length, player: 'opponent', cell: aiCell }]);
	}, delay);
}

/** Reset the move log and play again. */
export async function requestRematch(matchId: string): Promise<void> {
	const rec = ensureMatch(matchId);
	console.log('[match] requestRematch', matchId);
	rec.moves.set([]);
}
