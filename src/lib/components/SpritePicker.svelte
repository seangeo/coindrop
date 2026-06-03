<script lang="ts">
	import PixelSprite from './PixelSprite.svelte';
	import { SPRITE_NAMES, type SpriteName } from '$lib/sprites';

	let { value, onselect }: { value: SpriteName; onselect: (s: SpriteName) => void } = $props();
</script>

<div class="grid" role="radiogroup" aria-label="Choose your sprite">
	{#each SPRITE_NAMES as name (name)}
		<button
			type="button"
			class="cell"
			class:active={name === value}
			role="radio"
			aria-checked={name === value}
			aria-label={name}
			onclick={() => onselect(name)}
		>
			<PixelSprite {name} size={28} />
		</button>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(6, 1fr);
		gap: var(--gap-sm);
	}
	.cell {
		aspect-ratio: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		color: var(--text-dim);
		cursor: pointer;
		transition:
			border-color 0.15s,
			color 0.15s,
			box-shadow 0.2s,
			transform 0.08s;
	}
	.cell:hover {
		color: var(--accent-bright);
		border-color: var(--accent-line);
		transform: translateY(-1px);
	}
	.cell.active {
		color: var(--accent);
		border-color: var(--accent);
		background: var(--bg-2);
		box-shadow:
			inset 0 0 14px -5px var(--accent-glow),
			0 0 16px -6px var(--accent-glow);
	}
	@media (max-width: 420px) {
		.grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}
</style>
