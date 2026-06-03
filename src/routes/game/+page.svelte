<script lang="ts">
	import { goto } from '$app/navigation';
	import { get } from 'svelte/store';
	import { activeMatchId } from '$lib/supabase/match';

	// Bare /game has no match id. Send to the active match if one exists,
	// otherwise back to the lobby to start one.
	$effect(() => {
		const id = get(activeMatchId);
		goto(id ? `/game/${id}` : '/', { replaceState: true });
	});
</script>

<div class="loading"><span class="eyebrow">No active game — returning to lobby…</span></div>

<style>
	.loading {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
</style>
