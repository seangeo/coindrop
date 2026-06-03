<script lang="ts">
	import PixelSprite from './PixelSprite.svelte';
	import type { SpriteName } from '$lib/sprites';

	let { onplay }: { onplay: () => void } = $props();

	// The games catalog is DATA (PRD §7) so "more games" is a data change, not a
	// UI rewrite — only tic-tac-toe is live; the rest are placeholders.
	const games: { id: string; name: string; tag: string; sprite: SpriteName; live: boolean }[] = [
		{ id: 'ttt', name: 'TIC-TAC-TOE', tag: '1v1 · 60s', sprite: 'invader', live: true },
		{ id: 'soon1', name: '???', tag: 'COMING SOON', sprite: 'ghost', live: false },
		{ id: 'soon2', name: '???', tag: 'COMING SOON', sprite: 'ufo', live: false }
	];
</script>

<div class="games">
	{#each games as g (g.id)}
		<button
			class="game-tile"
			class:live={g.live}
			disabled={!g.live}
			onclick={() => g.live && onplay()}
		>
			<span class="sprite" class:live={g.live}>
				<PixelSprite name={g.sprite} size={30} />
			</span>
			<span class="meta">
				<span class="display gname">{g.name}</span>
				<span class="eyebrow" style="letter-spacing:0.18em;">{g.tag}</span>
			</span>
			{#if g.live}<span class="chevron">▸</span>{/if}
		</button>
	{/each}
</div>

<style>
	.games {
		display: grid;
		gap: var(--gap-sm);
	}
	.game-tile {
		display: flex;
		align-items: center;
		gap: var(--pad-sm);
		padding: var(--pad-sm);
		text-align: left;
		background: transparent;
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		cursor: not-allowed;
		opacity: 0.45;
		color: var(--text);
		position: relative;
		overflow: hidden;
		transition:
			border-color 0.15s,
			box-shadow 0.2s,
			transform 0.08s;
	}
	.game-tile.live {
		background: var(--bg-2);
		border-color: var(--accent-line);
		cursor: pointer;
		opacity: 1;
	}
	.sprite {
		width: 48px;
		height: 48px;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r-sm);
		color: var(--text-faint);
	}
	.sprite.live {
		color: var(--accent);
		box-shadow: inset 0 0 14px -5px var(--accent-glow);
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
		min-width: 0;
	}
	.gname {
		font-size: 14px;
		letter-spacing: 0.01em;
		white-space: nowrap;
	}
	.chevron {
		margin-left: auto;
		color: var(--accent);
		font-size: 18px;
	}
</style>
