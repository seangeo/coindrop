<script lang="ts">
	let { size = 64, color = 'var(--warm)' }: { size?: number | string; color?: string } = $props();
</script>

<svg
	width={size}
	height={size}
	viewBox="0 0 100 100"
	style="display:block; filter: drop-shadow(0 0 10px var(--warm-glow))"
	aria-hidden="true"
>
	<circle cx="50" cy="50" r="28" stroke={color} stroke-width="13" fill="none" />
</svg>
