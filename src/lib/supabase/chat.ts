/* chat.ts — the lobby chat (persistent).
 *
 * MOCK SHAPE:
 *   messages: ChatMessage[]   ({ who, sprite?, me?, text, t }; who '_system' = activity line)
 *   chatState: 'loading' | 'ready' | 'error'
 *   sendMessage(text)  → optimistic append of the local player's line
 *
 * Chat is PERSISTED (PRD §5): history shows on load and survives a refresh,
 * delivered live via Postgres Changes. (Contrast: challenges are ephemeral.) The
 * mock fakes "the room keeps talking" by appending an ambient line every ~4.2s.
 *
 * Realtime primitive (PRD §6): POSTGRES CHANGES on a messages table.
 *
 * TODO(sean): replace with real persisted chat:
 *   - On load: SELECT recent rows from the messages table → seed `messages`.
 *   - Subscribe to postgres_changes (INSERT) on messages → append live.
 *   - sendMessage(text): INSERT a row (RLS controls who can post); the realtime
 *     INSERT echoes it back, so you may drop the optimistic append or reconcile.
 *   - DELETE the ambient-line timer (that's just mock liveness).
 */

import { writable, get } from 'svelte/store';
import { browser } from '$app/environment';
import { currentUser } from './auth';
import type { ChatMessage, LoadState } from './types';

const SEED: ChatMessage[] = [
	{ who: 'NEONFOX', sprite: 'invader', text: 'anyone up for a round?', t: '21:58' },
	{ who: 'SOL_77', sprite: 'ufo', text: 'gg glitch that was brutal', t: '21:59' },
	{ who: 'GLITCH', sprite: 'squid', text: 'center opening every time, works', t: '22:00' },
	{ who: '_system', text: 'TURBO_K challenged NOVA', t: '22:00' },
	{ who: 'ECHO', sprite: 'cat', text: 'who taught the rookie corner traps lol', t: '22:01' },
	{ who: 'MAXOUT', sprite: 'robot', text: 'rematch me quasar, i want my points back', t: '22:02' },
	{ who: 'VECTOR', sprite: 'alienb', text: "lobby's lively tonight", t: '22:03' }
];

// Lines the simulated room keeps dropping in, to feel alive.
const AMBIENT: ChatMessage[] = [
	{ who: 'SOL_77', sprite: 'ufo', text: 'brb grabbing a refill', t: '' },
	{ who: '_system', text: 'ZAPDOS won vs ECHO', t: '' },
	{ who: 'NEONFOX', sprite: 'invader', text: 'first move corner is underrated', t: '' },
	{ who: 'PIX3L', sprite: 'ghost', text: 'draw again ugh', t: '' },
	{ who: '_system', text: 'BYTE_ME joined the lobby', t: '' },
	{ who: 'MAXOUT', sprite: 'robot', text: 'ok quasar where you at', t: '' },
	{ who: 'VECTOR', sprite: 'alienb', text: 'this scanline filter is so clean', t: '' },
	{ who: '_system', text: 'GLITCH challenged SOL_77', t: '' },
	{ who: 'ECHO', sprite: 'cat', text: 'running it back', t: '' },
	{ who: 'NOVA', sprite: 'skull', text: 'x always goes center, predictable', t: '' }
];

export const messages = writable<ChatMessage[]>([]);
export const chatState = writable<LoadState>('loading');

function nowStamp(): string {
	const d = new Date();
	return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

if (browser) {
	setTimeout(() => {
		messages.set(SEED);
		chatState.set('ready');

		// Keep the room talking (mock liveness only).
		let i = 0;
		setInterval(() => {
			const base = AMBIENT[i % AMBIENT.length];
			i += 1;
			messages.update((c) => [...c.slice(-40), { ...base, t: nowStamp() }]);
		}, 4200);
	}, 350);
}

/** Send a chat line to the room. Optimistically appended in the mock. */
export async function sendMessage(text: string): Promise<void> {
	const body = text.trim();
	if (!body) return;
	const me = get(currentUser);
	console.log('[chat] sendMessage', { text: body });
	messages.update((c) => [
		...c.slice(-40),
		{
			who: me?.name ?? 'YOU',
			sprite: me?.sprite ?? 'ship',
			me: true,
			text: body,
			t: nowStamp()
		}
	]);
}
