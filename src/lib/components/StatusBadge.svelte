<script lang="ts">
	import type { PresenceStatus } from '$lib/supabase/types';

	let { status, vs }: { status: PresenceStatus; vs?: string } = $props();
</script>

{#if status === 'in_game'}
	<span class="badge badge-game" title={vs ? 'Playing ' + vs : 'In a game'}>
		<span class="dot"></span>
		{vs ? 'VS ' + vs : 'IN GAME'}
	</span>
{:else if status === 'away'}
	<span class="badge badge-idle"><span class="dot"></span>AWAY</span>
{:else}
	<span class="badge badge-lobby"><span class="dot"></span>IN LOBBY</span>
{/if}
