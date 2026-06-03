<script lang="ts">
	import { SPRITES, type SpriteName } from '$lib/sprites';

	let {
		name = 'invader',
		size = 28,
		color = 'currentColor'
	}: { name?: SpriteName; size?: number; color?: string } = $props();

	const cell = 10;
	let map = $derived(SPRITES[name] ?? SPRITES.invader);
	let rows = $derived(map.length);
	let cols = $derived(map[0].length);
	let rects = $derived.by(() => {
		const out: { x: number; y: number }[] = [];
		for (let y = 0; y < map.length; y++) {
			for (let x = 0; x < map[y].length; x++) {
				if (map[y][x] === 'X') out.push({ x: x * cell, y: y * cell });
			}
		}
		return out;
	});
</script>

<svg
	width={size}
	height={size * (rows / cols)}
	viewBox={`0 0 ${cols * cell} ${rows * cell}`}
	style="display:block"
	shape-rendering="crispEdges"
	aria-hidden="true"
>
	{#each rects as r (r.x + '-' + r.y)}
		<rect x={r.x} y={r.y} width={cell} height={cell} fill={color} />
	{/each}
</svg>
