<script lang="ts">
	import Avatar from './Avatar.svelte';
	import StatusBadge from './StatusBadge.svelte';
	import type { RosterPlayer } from '$lib/supabase/types';

	let {
		player,
		i = 0,
		onchallenge
	}: { player: RosterPlayer; i?: number; onchallenge: (p: RosterPlayer) => void } = $props();

	let inGame = $derived(player.status === 'in_game');
	let away = $derived(player.status === 'away');
</script>

<div class="roster-row" style="animation-delay: calc({0.04 * i}s / var(--anim,1)); opacity:{away ? 0.6 : 1};">
	<Avatar sprite={player.sprite} status={player.status} size={40} />
	<div class="info">
		<div class="name-row">
			<span class="mono name">{player.name}</span>
		</div>
		<div class="rec-row">
			<span class="record">{player.wins}W · {player.losses}L</span>
		</div>
	</div>
	<StatusBadge status={player.status} vs={player.vs} />
	<button
		class="btn btn-ghost roster-cta"
		disabled={inGame || away}
		onclick={() => onchallenge(player)}
	>
		{inGame ? 'BUSY' : 'CHALLENGE'}
	</button>
</div>

<style>
	.roster-row {
		display: flex;
		align-items: center;
		gap: var(--pad-sm);
		min-height: var(--row-h);
		padding: 0 var(--pad-sm);
		border-radius: var(--r-sm);
	}
	.info {
		min-width: 0;
		flex: 1;
	}
	.name-row {
		display: flex;
		align-items: center;
		gap: 8px;
	}
	.name {
		font-weight: 700;
		font-size: var(--fs-body);
		color: var(--text);
	}
	.rec-row {
		display: flex;
		align-items: center;
		gap: 6px;
		margin-top: 3px;
	}
	.record {
		font-size: 11px;
		color: var(--text-faint);
		letter-spacing: 0.05em;
	}
	.roster-cta {
		padding: 7px 12px;
		font-size: 11px;
	}
</style>
