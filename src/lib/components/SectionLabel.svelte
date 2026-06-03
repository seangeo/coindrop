<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, right }: { children: Snippet; right?: Snippet } = $props();
</script>

<div class="section-label">
	<div class="eyebrow">{@render children()}</div>
	{#if right}{@render right()}{/if}
</div>

<style>
	.section-label {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 10px;
	}
</style>
