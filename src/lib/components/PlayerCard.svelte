<script lang="ts">
	import PixelSprite from './PixelSprite.svelte';
	import MarkX from './MarkX.svelte';
	import MarkO from './MarkO.svelte';
	import type { Player } from '$lib/supabase/types';

	let {
		player,
		mark,
		align = 'left',
		active = false,
		you = false
	}: {
		player: Player;
		mark: 'X' | 'O';
		align?: 'left' | 'right';
		active?: boolean;
		you?: boolean;
	} = $props();

	let right = $derived(align === 'right');
</script>

<div class="card" class:right>
	<div class="head" class:right>
		<div class="tile" class:active>
			<PixelSprite name={player.sprite} size={40} />
		</div>
		<div style="text-align:{right ? 'right' : 'left'}">
			<div class="display name">{player.name}{you ? ' (you)' : ''}</div>
			<div class="record">{player.wins}W · {player.losses}L</div>
		</div>
	</div>
	<div class="pill">
		<span style="color:{mark === 'X' ? 'var(--accent)' : 'var(--warm)'}; display:flex;">
			{#if mark === 'X'}<MarkX size={18} />{:else}<MarkO size={18} />{/if}
		</span>
		<span class="eyebrow" style="letter-spacing:0.2em;">PLAYS {mark}</span>
	</div>
</div>

<style>
	.card {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 14px;
		justify-self: start;
		max-width: 260px;
	}
	.card.right {
		align-items: flex-end;
		justify-self: end;
	}
	.head {
		display: flex;
		align-items: center;
		gap: 14px;
		flex-direction: row;
	}
	.head.right {
		flex-direction: row-reverse;
	}
	.tile {
		width: 64px;
		height: 64px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r);
		border: 1px solid var(--line-strong);
		color: var(--accent);
		transition: all 0.25s;
	}
	.tile.active {
		border-color: var(--accent);
		box-shadow: 0 0 22px -4px var(--accent-glow);
	}
	.name {
		font-size: 19px;
		color: var(--text);
		white-space: nowrap;
	}
	.record {
		font-size: 11.5px;
		color: var(--text-faint);
		margin-top: 2px;
	}
	.pill {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 5px 12px;
		border-radius: 99px;
		border: 1px solid var(--line);
		background: var(--bg-2);
	}
</style>
