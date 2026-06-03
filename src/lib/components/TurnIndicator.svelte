<script lang="ts">
	import type { MatchStatus } from '$lib/supabase/types';

	let {
		status,
		whoseTurn,
		winner,
		opponentName
	}: {
		status: MatchStatus;
		whoseTurn: 'me' | 'opponent';
		winner: 'me' | 'opponent' | null;
		opponentName: string;
	} = $props();

	let live = $derived(status === 'active');
	let yourTurn = $derived(whoseTurn === 'me');

	let label = $derived.by(() => {
		if (status === 'won') return winner === 'me' ? 'YOU WIN' : opponentName + ' WINS';
		if (status === 'drawn') return 'DRAW GAME';
		return yourTurn ? 'YOUR TURN' : opponentName + ' IS THINKING';
	});
	let color = $derived.by(() => {
		if (status === 'won') return winner === 'me' ? 'var(--accent)' : 'var(--danger)';
		if (status === 'drawn') return 'var(--text-dim)';
		return yourTurn ? 'var(--accent)' : 'var(--warm)';
	});
	let highlight = $derived(live && yourTurn);
</script>

<div
	class="turn"
	style="border-color:{highlight ? 'var(--accent-line)' : 'var(--line-strong)'};
		background:{highlight ? 'var(--accent-soft)' : 'var(--bg-2)'};"
>
	<span
		class="dot"
		class:live
		style="background:{color}; box-shadow: 0 0 8px {color};"
	></span>
	<span class="display label" style="color:{color}; text-shadow: 0 0 12px {color}66;">{label}</span>
</div>

<style>
	.turn {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		padding: 10px 20px;
		border-radius: 99px;
		border: 1px solid var(--line-strong);
		background: var(--bg-2);
		transition: all 0.25s;
	}
	.dot {
		width: 10px;
		height: 10px;
		border-radius: 99px;
	}
	.dot.live {
		animation: ping-solid 1.2s ease-in-out infinite;
	}
	.label {
		font-size: 17px;
		letter-spacing: 0.04em;
		white-space: nowrap;
	}
	@media (prefers-reduced-motion: reduce) {
		.dot.live {
			animation: none;
		}
	}
</style>
