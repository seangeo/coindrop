<script lang="ts">
	import MarkX from './MarkX.svelte';
	import MarkO from './MarkO.svelte';
	import Confetti from './Confetti.svelte';
	import type { Board, Cell } from '$lib/ttt';
	import type { MatchStatus } from '$lib/supabase/types';

	let {
		board,
		winLine = null,
		status,
		yourTurn,
		celebrate = false,
		onplay
	}: {
		board: Board;
		winLine?: [number, number, number] | null;
		status: MatchStatus;
		yourTurn: boolean;
		celebrate?: boolean;
		onplay: (cell: number) => void;
	} = $props();

	const markSize = 'min(16vh, 120px)';

	function playable(cell: Cell): boolean {
		return status === 'active' && yourTurn && !cell;
	}
</script>

<div class="board-wrap">
	<div class="board">
		{#each board as cell, i (i)}
			{@const winning = !!winLine && winLine.includes(i)}
			<button
				class="ttt-cell"
				class:winning
				disabled={!playable(cell)}
				onclick={() => playable(cell) && onplay(i)}
				aria-label={`cell ${i + 1}${cell ? ', ' + cell : ', empty'}`}
			>
				{#if cell}
					<span class="mark">
						{#if cell === 'X'}<MarkX size={markSize} />{:else}<MarkO size={markSize} />{/if}
					</span>
				{/if}
			</button>
		{/each}
	</div>
	<Confetti show={celebrate} />
</div>

<style>
	.board-wrap {
		position: relative;
	}
	.board {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10px;
		width: min(56vh, 440px);
		aspect-ratio: 1;
	}
	.ttt-cell {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-2);
		border: 1px solid var(--line-strong);
		border-radius: var(--r);
		cursor: default;
		position: relative;
		transition:
			background 0.2s,
			border-color 0.2s,
			box-shadow 0.3s;
	}
	.ttt-cell:not(:disabled) {
		cursor: pointer;
	}
	.ttt-cell.winning {
		background: var(--accent-soft);
		border-color: var(--accent);
		box-shadow:
			0 0 24px -4px var(--accent-glow),
			inset 0 0 20px -8px var(--accent-glow);
	}
	.mark {
		animation: mark-in 0.35s cubic-bezier(0.2, 0.8, 0.3, 1.2) both;
	}
	@media (prefers-reduced-motion: reduce) {
		.mark {
			animation: none;
		}
	}
</style>
