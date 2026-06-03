<script lang="ts">
	let { label = 'LIVE' }: { label?: string } = $props();
	const bars = [0, 1, 2];
</script>

<span class="live">
	<span class="bars">
		{#each bars as i (i)}
			<span
				class="bar"
				style="animation: eq calc({0.7 + i * 0.18}s / var(--anim,1)) ease-in-out {i *
					0.12}s infinite alternate;"
			></span>
		{/each}
	</span>
	<span class="label">{label}</span>
</span>

<style>
	.live {
		display: inline-flex;
		align-items: center;
		gap: 7px;
	}
	.bars {
		display: inline-flex;
		align-items: flex-end;
		gap: 2px;
		height: 11px;
	}
	.bar {
		width: 3px;
		background: var(--accent);
		border-radius: 1px;
		box-shadow: 0 0 5px var(--accent-glow);
	}
	.label {
		font-family: var(--font-mono);
		font-size: 10px;
		font-weight: 700;
		letter-spacing: 0.22em;
		color: var(--accent-bright);
	}
	@media (prefers-reduced-motion: reduce) {
		.bar {
			animation: none !important;
			height: 7px !important;
		}
	}
</style>
