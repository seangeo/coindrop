<script lang="ts">
	import { onMount } from 'svelte';
	import PixelSprite from './PixelSprite.svelte';
	import type { Player } from '$lib/supabase/types';

	let {
		opponent,
		onready,
		oncancel
	}: { opponent: Player; onready: () => void; oncancel: () => void } = $props();

	let phase = $state<'calling' | 'accepted'>('calling');

	onMount(() => {
		// In production these phases are driven by the opponent's real accept,
		// not timers (see challenges.ts).
		const t1 = setTimeout(() => (phase = 'accepted'), 1400);
		const t2 = setTimeout(onready, 2200);
		return () => {
			clearTimeout(t1);
			clearTimeout(t2);
		};
	});
</script>

<div class="backdrop">
	<div class="panel box">
		<div class="sprite" class:calling={phase === 'calling'} class:accepted={phase === 'accepted'}>
			<PixelSprite name={opponent.sprite} size={44} />
		</div>
		<div class="display name">{opponent.name}</div>
		<div
			class="eyebrow status"
			style="color:{phase === 'accepted' ? 'var(--accent)' : 'var(--text-dim)'};
				margin-bottom:{phase === 'accepted' ? 0 : 18}px;"
		>
			{phase === 'calling' ? 'DROPPING COIN…' : '✓ CHALLENGE ACCEPTED'}
		</div>
		{#if phase === 'calling'}
			<button class="btn btn-ghost" style="margin-top:6px;" onclick={oncancel}>CANCEL</button>
		{/if}
	</div>
</div>

<style>
	.backdrop {
		position: fixed;
		inset: 0;
		z-index: 8000;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(2, 5, 8, 0.82);
		animation: backdrop-in 0.2s both;
	}
	.box {
		padding: 32px var(--pad);
		text-align: center;
		width: min(380px, 90vw);
		box-shadow: 0 0 50px -12px var(--accent-glow);
	}
	.sprite {
		width: 72px;
		height: 72px;
		margin: 0 auto 18px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r);
		color: var(--accent);
		border: 1px solid var(--accent-line);
	}
	.sprite.calling {
		animation: pulse-soft 1s ease-in-out infinite;
	}
	.sprite.accepted {
		animation: win-pop 0.4s both;
	}
	.name {
		font-size: 19px;
		margin-bottom: 6px;
	}
	@media (prefers-reduced-motion: reduce) {
		.sprite.calling,
		.sprite.accepted {
			animation: none;
		}
	}
</style>
