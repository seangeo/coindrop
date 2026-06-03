/* presence.ts — who's in the arcade right now (the lobby roster).
 *
 * MOCK SHAPE:
 *   arcadeRoster: RosterPlayer[]   ({ id, name, sprite, wins, losses, status, vs? })
 *   rosterState:  'loading' | 'ready' | 'error'   (drives loading/empty/error UI)
 *   joinArcade()  → announce self present
 *   leaveArcade() → announce self gone
 *
 * Realtime primitive (PRD §6): PRESENCE. The roster + per-player status (in
 * lobby / in game) is Presence metadata; presence dots & online count come from
 * the live channel state.
 *
 * TODO(sean): replace with a Supabase Realtime presence channel, e.g.
 *   const ch = supabase.channel('arcade', { config: { presence: { key: userId } } });
 *   ch.on('presence', { event: 'sync' }, () => { ...rebuild roster from ch.presenceState()... });
 *   joinArcade():  ch.subscribe(s => s === 'SUBSCRIBED' && ch.track({ status, sprite, ... }));
 *   leaveArcade(): ch.untrack(); supabase.removeChannel(ch);
 *   Update status to 'in_game' (with `vs`) via ch.track(...) when a match starts.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { RosterPlayer, LoadState } from './types';

const SEED: RosterPlayer[] = [
	{ id: 'p1', name: 'NEONFOX', sprite: 'invader', status: 'lobby', wins: 41, losses: 19 },
	{ id: 'p2', name: 'GLITCH', sprite: 'squid', status: 'in_game', wins: 38, losses: 22, vs: 'PIX3L' },
	{ id: 'p3', name: 'PIX3L', sprite: 'ghost', status: 'in_game', wins: 33, losses: 25, vs: 'GLITCH' },
	{ id: 'p4', name: 'SOL_77', sprite: 'ufo', status: 'lobby', wins: 52, losses: 14 },
	{ id: 'p5', name: 'MAXOUT', sprite: 'robot', status: 'lobby', wins: 29, losses: 30 },
	{ id: 'p6', name: 'VECTOR', sprite: 'alienb', status: 'lobby', wins: 18, losses: 12 },
	{ id: 'p7', name: 'TURBO_K', sprite: 'rocket', status: 'in_game', wins: 47, losses: 20, vs: 'NOVA' },
	{ id: 'p8', name: 'NOVA', sprite: 'skull', status: 'in_game', wins: 44, losses: 21, vs: 'TURBO_K' },
	{ id: 'p9', name: 'ECHO', sprite: 'cat', status: 'lobby', wins: 12, losses: 9 },
	{ id: 'p10', name: 'BYTE_ME', sprite: 'bug', status: 'away', wins: 8, losses: 15 },
	{ id: 'p11', name: 'ZAPDOS', sprite: 'heart', status: 'lobby', wins: 21, losses: 17 },
	{ id: 'p12', name: 'ORBITAL', sprite: 'invader', status: 'away', wins: 5, losses: 11 }
];

export const arcadeRoster = writable<RosterPlayer[]>([]);
export const rosterState = writable<LoadState>('loading');

// Mock async load: empty + loading briefly, then populate (so the loading and
// ready states are both real and observable).
if (browser) {
	setTimeout(() => {
		arcadeRoster.set(SEED);
		rosterState.set('ready');
	}, 400);
}

export async function joinArcade(): Promise<void> {
	console.log('[presence] joinArcade');
}

export async function leaveArcade(): Promise<void> {
	console.log('[presence] leaveArcade');
}
