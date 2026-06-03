/* auth.ts — who the current player is, and entering / leaving the arcade.
 *
 * MOCK SHAPE:
 *   currentUser: Player | null   (null = not entered → entry guard sends to /enter)
 *   enterArcade(handle, sprite)  → resolves to a mock session, sets currentUser
 *   signOut()                    → clears currentUser
 *
 * The entry flow simulates Supabase ANONYMOUS sign-in: a player picks a handle +
 * sprite and drops straight in (no email/password). For the mock, stats are faked.
 *
 * TODO(sean): replace bodies with real Supabase Auth. The intended mapping:
 *   enterArcade(handle, sprite):
 *     const { data, error } = await supabase.auth.signInAnonymously({
 *       options: { data: { handle, sprite } }      // stored in user_metadata
 *     });
 *     // derive currentUser from data.user (handle/sprite from user_metadata,
 *     // wins/losses from a profiles row or a leaderboard query).
 *   signOut(): await supabase.auth.signOut();
 *   Also: subscribe to supabase.auth.onAuthStateChange(...) to keep currentUser
 *   in sync (Supabase persists the session itself — no localStorage needed).
 *   Anonymous users authenticate as the `authenticated` role and carry an
 *   `is_anonymous: true` JWT claim, usable in RLS if you want permanent-only gates.
 */

import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import type { Player } from './types';
import type { SpriteName } from '$lib/sprites';

const STORAGE_KEY = 'coindrop.mock.currentUser';

function loadPersisted(): Player | null {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		return raw ? (JSON.parse(raw) as Player) : null;
	} catch {
		return null;
	}
}

export const currentUser = writable<Player | null>(loadPersisted());

// Mock-only: keep the chosen identity across dev reloads so you don't re-enter
// every time. Real Supabase persists the session for you — drop this.
function persist(u: Player | null): void {
	if (!browser) return;
	if (u) localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
	else localStorage.removeItem(STORAGE_KEY);
}

/** Enter the arcade with a chosen handle + sprite. Mocked anonymous sign-in. */
export async function enterArcade(handle: string, sprite: SpriteName): Promise<Player> {
	console.log('[auth] enterArcade', { handle, sprite });
	// Simulate a tiny round-trip so the entry button can show a pending state.
	await new Promise((r) => setTimeout(r, 350));
	const user: Player = {
		id: 'me',
		name: handle.trim().toUpperCase() || 'PLAYER',
		sprite,
		// Faked lifetime record for the mock identity.
		wins: 24,
		losses: 11
	};
	currentUser.set(user);
	persist(user);
	return user;
}

/** Leave the arcade — clears the session; the guard returns to /enter. */
export async function signOut(): Promise<void> {
	console.log('[auth] signOut');
	currentUser.set(null);
	persist(null);
}
