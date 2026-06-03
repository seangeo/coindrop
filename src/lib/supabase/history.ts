/* history.ts — the current player's previous games.
 *
 * MOCK SHAPE:
 *   matchHistory: HistoryEntry[]  ({ opp, oppSprite, result, mark, when })
 *   historyState: 'loading' | 'ready' | 'error'
 *
 * This is a HISTORICAL READ, not a Realtime feature (PRD §8/§10). The move log
 * stays append-only so replay remains possible later, but no replay UI is built.
 *
 * TODO(sean): replace with a query of the current player's finished matches:
 *   - SELECT from matches where I participated, ordered by ended_at desc, joining
 *     opponent handle/sprite and computing result + which mark I played.
 *   - Compute relative `when` from the timestamp (or do it in the UI).
 *   No subscription needed — load once on mount.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { HistoryEntry, LoadState } from './types';

const SEED: HistoryEntry[] = [
	{ opp: 'MAXOUT', oppSprite: 'robot', result: 'win', mark: 'X', when: '12m ago' },
	{ opp: 'PIX3L', oppSprite: 'ghost', result: 'loss', mark: 'O', when: '31m ago' },
	{ opp: 'ECHO', oppSprite: 'cat', result: 'win', mark: 'X', when: '1h ago' },
	{ opp: 'SOL_77', oppSprite: 'ufo', result: 'draw', mark: 'O', when: '1h ago' },
	{ opp: 'NEONFOX', oppSprite: 'invader', result: 'win', mark: 'X', when: '2h ago' },
	{ opp: 'TURBO_K', oppSprite: 'rocket', result: 'loss', mark: 'O', when: '3h ago' },
	{ opp: 'VECTOR', oppSprite: 'alienb', result: 'win', mark: 'X', when: 'yesterday' },
	{ opp: 'GLITCH', oppSprite: 'squid', result: 'win', mark: 'X', when: 'yesterday' }
];

export const matchHistory = writable<HistoryEntry[]>([]);
export const historyState = writable<LoadState>('loading');

if (browser) {
	setTimeout(() => {
		matchHistory.set(SEED);
		historyState.set('ready');
	}, 450);
}
