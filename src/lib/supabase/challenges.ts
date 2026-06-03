/* challenges.ts — ephemeral, directed challenges + the unified random-match flow.
 *
 * MOCK SHAPE:
 *   incomingChallenge: IncomingChallenge | null   ({ id, from: Player, game })
 *     — ephemeral: NO history is kept (contrast with persisted chat).
 *   sendChallenge(targetUserId) → directed challenge; resolves to the opponent
 *   joinRandomQueue()           → join the pool; resolves to a matched opponent
 *   acceptChallenge(id)         → accept an incoming challenge; returns new matchId
 *   declineChallenge(id)        → dismiss an incoming challenge
 *   simulateIncomingChallenge() → DEV-ONLY: fake a "challenge received" to demo
 *                                  the coin-drop modal. Remove once Broadcast is wired.
 *
 * Challenge and random-match are ONE flow with an optional target (PRD §5):
 * directed sets a target; random leaves it null and claims from a pool. Both
 * resolve into a match the user is dropped into.
 *
 * Realtime primitive (PRD §6): BROADCAST — challenges/invites are ephemeral and
 * directed, delivered over PER-USER channels gated by RLS over realtime.messages
 * (you can only receive your own — the centerpiece authorization lesson).
 *
 * TODO(sean): replace with real Broadcast over a per-user channel:
 *   - Listen on a channel like `user:${myId}`; on a 'challenge' broadcast event,
 *     set incomingChallenge. RLS over realtime.messages must ensure you can only
 *     subscribe to your own channel.
 *   - sendChallenge(targetUserId): broadcast a 'challenge' to `user:${targetUserId}`.
 *   - joinRandomQueue(): insert/claim a match-request with null target (the
 *     single-pool claim lesson — lock so two players can't grab one request).
 *   - acceptChallenge(id): create the match (see match.ts createMatch TODO) and
 *     broadcast acceptance back so the challenger is dropped in too.
 *   - DELETE simulateIncomingChallenge and its lobby button.
 */

import { writable, get } from 'svelte/store';
import { arcadeRoster } from './presence';
import { createMatch } from './match';
import type { IncomingChallenge, RosterPlayer } from './types';

export const incomingChallenge = writable<IncomingChallenge | null>(null);

const GAME = 'Tic-Tac-Toe';

function randomLobbyPlayer(): RosterPlayer | null {
	const pool = get(arcadeRoster).filter((p) => p.status === 'lobby');
	if (!pool.length) return null;
	return pool[Math.floor(Math.random() * pool.length)];
}

/** Directed challenge. Mock resolves immediately to the target opponent. */
export async function sendChallenge(targetUserId: string): Promise<RosterPlayer | null> {
	const target = get(arcadeRoster).find((p) => p.id === targetUserId) ?? null;
	console.log('[challenges] sendChallenge', { targetUserId, target: target?.name });
	return target;
}

/** Random match: claim someone from the lobby pool. */
export async function joinRandomQueue(): Promise<RosterPlayer | null> {
	const opp = randomLobbyPlayer();
	console.log('[challenges] joinRandomQueue', { matched: opp?.name });
	return opp;
}

/** Accept an incoming challenge → create the match, returns the matchId. */
export async function acceptChallenge(id: string): Promise<string | null> {
	const ch = get(incomingChallenge);
	console.log('[challenges] acceptChallenge', { id });
	incomingChallenge.set(null);
	if (!ch || ch.id !== id) return null;
	// Mock: you always play X and move first.
	return createMatch(ch.from, 'X');
}

/** Decline / dismiss an incoming challenge. */
export async function declineChallenge(id: string): Promise<void> {
	console.log('[challenges] declineChallenge', { id });
	incomingChallenge.set(null);
}

/** DEV-ONLY demo trigger for the coin-drop modal. Remove when Broadcast is real. */
export function simulateIncomingChallenge(): void {
	const from = randomLobbyPlayer();
	if (!from) return;
	console.log('[challenges] simulateIncomingChallenge', { from: from.name });
	incomingChallenge.set({
		id: `c${Date.now().toString(36)}`,
		from: { id: from.id, name: from.name, sprite: from.sprite, wins: from.wins, losses: from.losses },
		game: GAME
	});
}
