/* types.ts — shapes for the MOCK data behind the stub seam.
 *
 * ⚠️ These shapes are INVENTED by the front-end so the UI can render. The human
 * (Sean) owns the real Supabase schema and will reconcile these against it. They
 * are intentionally minimal — only what the UI needs to render.
 */

import type { SpriteName } from '$lib/sprites';

/** A player's identity + lifetime record. */
export interface Player {
	id: string;
	name: string; // arcade handle, e.g. "QUASAR"
	sprite: SpriteName;
	wins: number;
	losses: number;
}

/**
 * Presence status.
 *
 * NOTE: CLAUDE.md's stub contract lists `'lobby' | 'in_game'`. The design also
 * has an "away" presentation (faint row, no ping, "AWAY" badge), so the union is
 * extended with `'away'` here to render all three roster states. Maps to the
 * arcade.css presence/badge suffixes: lobby→lobby, in_game→game, away→idle.
 */
export type PresenceStatus = 'lobby' | 'in_game' | 'away';

/** A player as seen on the lobby roster (presence metadata). */
export interface RosterPlayer extends Player {
	status: PresenceStatus;
	/** Opponent handle when status === 'in_game'. */
	vs?: string;
}

/** An incoming, ephemeral challenge (no history kept). */
export interface IncomingChallenge {
	id: string;
	from: Player;
	game: string; // e.g. "Tic-Tac-Toe"
}

/** A single appended move in a match's event-sourced sequence. */
export interface MoveEvent {
	seq: number; // 0-based move index; the turn-race guard in the real RPC
	player: 'me' | 'opponent';
	cell: number; // 0..8
}

export type MatchStatus = 'active' | 'won' | 'drawn';

/** Derived, ready-to-render match state (folded from the move sequence). */
export interface MatchState {
	matchId: string;
	board: import('$lib/ttt').Board; // length-9 derived board
	whoseTurn: 'me' | 'opponent';
	status: MatchStatus;
	winner: 'me' | 'opponent' | null;
	winningLine: [number, number, number] | null;
	you: Player;
	opponent: Player;
	yourMark: 'X' | 'O';
}

/** A chat line. `who === '_system'` renders as a centered activity divider. */
export interface ChatMessage {
	who: string; // handle, or "_system"
	sprite?: SpriteName;
	me?: boolean;
	text: string;
	t: string; // "HH:MM" timestamp
}

/** A row on the leaderboard (ranked client-side by wins). */
export interface LeaderboardEntry extends Player {
	you?: boolean;
}

/** One of the current player's past games. */
export interface HistoryEntry {
	opp: string;
	oppSprite: SpriteName;
	result: 'win' | 'loss' | 'draw';
	mark: 'X' | 'O';
	when: string; // relative, e.g. "12m ago"
}

/** Generic async load state for data-backed views. */
export type LoadState = 'loading' | 'ready' | 'error';
