<script lang="ts">
	import PixelSprite from './PixelSprite.svelte';
	import type { SpriteName } from '$lib/sprites';
	import type { PresenceStatus } from '$lib/supabase/types';

	let {
		sprite,
		status = 'lobby',
		size = 44,
		showPresence = true
	}: {
		sprite: SpriteName;
		status?: PresenceStatus;
		size?: number;
		showPresence?: boolean;
	} = $props();

	// arcade.css presence suffixes: lobby→lobby, in_game→game, away→idle
	const SUFFIX: Record<PresenceStatus, string> = { lobby: 'lobby', in_game: 'game', away: 'idle' };
	let presenceClass = $derived('presence is-' + SUFFIX[status]);
</script>

<div class="avatar" style="width:{size}px; height:{size}px;">
	<div class="tile" style="width:{size}px; height:{size}px;">
		<PixelSprite name={sprite} size={size * 0.6} />
	</div>
	{#if showPresence}
		<span class={presenceClass}></span>
	{/if}
</div>

<style>
	.avatar {
		position: relative;
		flex: none;
	}
	.tile {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border: 1px solid var(--accent-line);
		border-radius: var(--r-sm);
		color: var(--accent);
		box-shadow: inset 0 0 12px -4px var(--accent-glow);
	}
</style>
