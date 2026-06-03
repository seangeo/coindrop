<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import PlayerCard from '$lib/components/PlayerCard.svelte';
	import TurnIndicator from '$lib/components/TurnIndicator.svelte';
	import Board from '$lib/components/Board.svelte';
	import { match, makeMove, requestRematch } from '$lib/supabase/match';

	let matchId = $derived(page.params.matchId ?? '');
	let mstore = $derived(match(matchId));
	let s = $derived($mstore);

	let ended = $derived(!!s && s.status !== 'active');
	let celebrate = $derived(!!s && s.status === 'won' && s.winner === 'me');
</script>

{#if s}
	<div class="game">
		<PlayerCard
			player={s.you}
			mark={s.yourMark}
			align="left"
			active={s.status === 'active' && s.whoseTurn === 'me'}
			you
		/>

		<div class="center">
			<TurnIndicator
				status={s.status}
				whoseTurn={s.whoseTurn}
				winner={s.winner}
				opponentName={s.opponent.name}
			/>
			<Board
				board={s.board}
				winLine={s.winningLine}
				status={s.status}
				yourTurn={s.whoseTurn === 'me'}
				{celebrate}
				onplay={(cell) => makeMove(matchId, cell)}
			/>
			<div class="controls">
				{#if ended}
					<div class="end">
						<button class="btn btn-accent btn-lg" onclick={() => requestRematch(matchId)}>
							↻ REMATCH
						</button>
						<button class="btn btn-ghost btn-lg" onclick={() => goto('/')}>
							← BACK TO LOBBY
						</button>
					</div>
				{:else}
					<span class="eyebrow">best of one · winner takes the points</span>
				{/if}
			</div>
		</div>

		<PlayerCard
			player={s.opponent}
			mark={s.yourMark === 'X' ? 'O' : 'X'}
			align="right"
			active={s.status === 'active' && s.whoseTurn === 'opponent'}
		/>
	</div>
{:else}
	<div class="loading"><span class="eyebrow">Loading match…</span></div>
{/if}

<style>
	.game {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: center;
		gap: var(--gap);
		height: 100%;
		padding: 0 var(--pad);
	}
	.center {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--gap);
	}
	.controls {
		height: 56px;
		display: flex;
		align-items: center;
		gap: 12px;
	}
	.end {
		display: flex;
		gap: 12px;
		animation: win-pop 0.4s both;
	}
	.loading {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	@media (prefers-reduced-motion: reduce) {
		.end {
			animation: none;
		}
	}
	@media (max-width: 760px) {
		.game {
			grid-template-columns: 1fr;
			align-content: center;
			gap: var(--pad);
		}
		.game :global(.card),
		.game :global(.card.right) {
			align-items: center;
			justify-self: center;
		}
	}
</style>
