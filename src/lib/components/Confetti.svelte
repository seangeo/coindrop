<script lang="ts">
	let { show = false }: { show?: boolean } = $props();

	const colors = ['var(--accent)', 'var(--accent-bright)', 'var(--warm)', '#fff'];
	// Pre-randomized bits so re-renders don't reshuffle.
	const bits: { left: number; delay: number; dur: number; color: string; sz: number }[] = [];
	for (let i = 0; i < 36; i++) {
		bits.push({
			left: Math.random() * 100,
			delay: Math.random() * 0.5,
			dur: 1.2 + Math.random() * 1.1,
			color: colors[i % colors.length],
			sz: 5 + Math.random() * 6
		});
	}
</script>

{#if show}
	<div class="confetti" aria-hidden="true">
		{#each bits as b, i (i)}
			<span
				style="left:{b.left}%; width:{b.sz}px; height:{b.sz * 1.6}px; background:{b.color};
					box-shadow: 0 0 6px {b.color};
					animation: confetti-fall {b.dur}s cubic-bezier(.3,.6,.5,1) {b.delay}s forwards;"
			></span>
		{/each}
	</div>
{/if}

<style>
	.confetti {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
		z-index: 5;
	}
	.confetti span {
		position: absolute;
		top: -20px;
	}
	@media (prefers-reduced-motion: reduce) {
		.confetti {
			display: none;
		}
	}
</style>
