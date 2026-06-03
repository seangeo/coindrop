<script lang="ts">
	let { size = 64, color = 'var(--accent)' }: { size?: number | string; color?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 100 100"
	shape-rendering="geometricPrecision"
	style="display:block; filter: drop-shadow(0 0 10px var(--accent-glow))"
	aria-hidden="true"
>
	<g stroke={color} stroke-width="13" stroke-linecap="square" fill="none">
		<line x1="22" y1="22" x2="78" y2="78" />
		<line x1="78" y1="22" x2="22" y2="78" />
	</g>
</svg>
