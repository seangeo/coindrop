<script lang="ts">
	import { onMount } from 'svelte';
	import PixelSprite from './PixelSprite.svelte';
	import type { IncomingChallenge } from '$lib/supabase/types';

	let {
		challenge,
		onaccept,
		ondecline
	}: { challenge: IncomingChallenge; onaccept: () => void; ondecline: () => void } = $props();

	let count = $state(10);
	let reduced = $state(false);

	onMount(() => {
		reduced =
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		const id = setInterval(() => {
			count -= 1;
			if (count <= 0) {
				clearInterval(id);
				ondecline();
			}
		}, 1000);
		return () => clearInterval(id);
	});

	let from = $derived(challenge.from);
</script>

<div
	class="backdrop"
	role="presentation"
	onclick={ondecline}
	onkeydown={(e) => e.key === 'Escape' && ondecline()}
>
	{#if !reduced}<div class="flash"></div>{/if}

	<div
		class="card-wrap"
		class:animate={!reduced}
		role="dialog"
		aria-modal="true"
		aria-label="Incoming challenge"
		tabindex="-1"
		onclick={(e) => e.stopPropagation()}
		onkeydown={(e) => e.stopPropagation()}
	>
		<div class="panel card">
			<div class="eyebrow drop-label">◎ &nbsp;COIN DROPPED&nbsp; ◎</div>

			<div class="sprite">
				<PixelSprite name={from.sprite} size={52} />
			</div>

			<div class="display glow handle">{from.name}</div>
			<div class="wants">wants to play <span class="game">{challenge.game}</span></div>
			<div class="meta">
				{from.wins}W · {from.losses}L · auto-declines in <span class="count">{count}s</span>
			</div>

			<div class="actions">
				<button class="btn btn-ghost btn-danger" style="flex:1; padding:13px;" onclick={ondecline}>
					✕ DECLINE
				</button>
				<button class="btn btn-accent" style="flex:1.4; padding:13px;" onclick={onaccept}>
					▸ ACCEPT &amp; PLAY
				</button>
			</div>
		</div>
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
		background: rgba(2, 5, 8, 0.78);
		animation: backdrop-in 0.25s ease both;
	}
	.flash {
		position: fixed;
		inset: 0;
		background: var(--accent);
		animation: coin-flash 0.5s ease-out both;
		pointer-events: none;
	}
	.card-wrap {
		position: absolute;
		left: 50%;
		top: calc(50% - 40px);
		width: min(420px, 90vw);
		transform: translate(-50%, 0);
		transform-origin: center top;
	}
	.card-wrap.animate {
		animation: coin-drop 0.75s cubic-bezier(0.3, 1.3, 0.5, 1) both;
	}
	.card {
		padding: var(--pad);
		text-align: center;
		border: 1px solid var(--accent);
		box-shadow:
			0 0 0 1px var(--accent),
			0 0 60px -8px var(--accent-glow),
			0 30px 60px -20px #000;
		background: linear-gradient(180deg, var(--accent-soft), transparent 140px), var(--bg-1);
	}
	.drop-label {
		color: var(--accent);
		margin-bottom: 16px;
		letter-spacing: 0.34em;
	}
	.sprite {
		width: 84px;
		height: 84px;
		margin: 0 auto 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r);
		border: 1px solid var(--accent-line);
		color: var(--accent);
		box-shadow: inset 0 0 22px -6px var(--accent-glow);
	}
	.handle {
		font-size: 24px;
		margin-bottom: 6px;
		color: var(--text);
	}
	.wants {
		font-size: 13.5px;
		color: var(--text-dim);
		margin-bottom: 4px;
	}
	.game {
		color: var(--accent-bright);
	}
	.meta {
		font-size: 11.5px;
		color: var(--text-faint);
		margin-bottom: 20px;
	}
	.count {
		color: var(--warm);
	}
	.actions {
		display: flex;
		gap: 10px;
	}
</style>
