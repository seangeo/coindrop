<script lang="ts">
	import { tick } from 'svelte';
	import { goto } from '$app/navigation';
	import SectionLabel from '$lib/components/SectionLabel.svelte';
	import GamesCatalog from '$lib/components/GamesCatalog.svelte';
	import RosterRow from '$lib/components/RosterRow.svelte';
	import ChatLine from '$lib/components/ChatLine.svelte';
	import LiveDot from '$lib/components/LiveDot.svelte';
	import Matchmaking from '$lib/components/Matchmaking.svelte';
	import ChallengeModal from '$lib/components/ChallengeModal.svelte';

	import { arcadeRoster, rosterState } from '$lib/supabase/presence';
	import { messages, chatState, sendMessage } from '$lib/supabase/chat';
	import {
		incomingChallenge,
		sendChallenge,
		joinRandomQueue,
		acceptChallenge,
		declineChallenge,
		simulateIncomingChallenge
	} from '$lib/supabase/challenges';
	import { createMatch } from '$lib/supabase/match';
	import type { Player, RosterPlayer } from '$lib/supabase/types';

	let matchmakingOpponent = $state<Player | null>(null);
	let draft = $state('');

	let onlineCount = $derived($arcadeRoster.filter((p) => p.status !== 'away').length);

	async function challengePlayer(p: RosterPlayer) {
		await sendChallenge(p.id);
		matchmakingOpponent = p;
	}
	async function playRandom() {
		const opp = await joinRandomQueue();
		if (opp) matchmakingOpponent = opp;
	}
	function matchReady() {
		if (!matchmakingOpponent) return;
		const id = createMatch(matchmakingOpponent, 'X');
		matchmakingOpponent = null;
		goto(`/game/${id}`);
	}
	async function accept(id: string) {
		const matchId = await acceptChallenge(id);
		if (matchId) goto(`/game/${matchId}`);
	}

	function submitChat(e: Event) {
		e.preventDefault();
		const text = draft;
		draft = '';
		sendMessage(text);
	}

	// Auto-scroll chat to newest whenever messages change.
	let chatScroll = $state<HTMLDivElement | null>(null);
	$effect(() => {
		$messages;
		tick().then(() => {
			if (chatScroll) chatScroll.scrollTop = chatScroll.scrollHeight;
		});
	});
</script>

<div class="lobby-grid">
	<!-- left rail: games + quick play -->
	<div class="rail">
		<div class="panel" style="padding: var(--pad);">
			<SectionLabel>Games</SectionLabel>
			<GamesCatalog onplay={playRandom} />
		</div>
		<div class="panel quick">
			<SectionLabel>Quick play</SectionLabel>
			<p class="copy">Drop a coin and we'll match you with anyone in the lobby.</p>
			<button
				class="btn btn-accent btn-block btn-lg"
				style="font-size:13px; letter-spacing:0.08em;"
				onclick={playRandom}
			>
				◎ PLAY RANDOM OPPONENT
			</button>
			<div class="divider">
				<span class="rule"></span>
				<span class="eyebrow">or pick someone →</span>
				<span class="rule"></span>
			</div>
			<!-- DEV-ONLY: demo the coin-drop. Remove when real Broadcast is wired. -->
			<button
				class="btn btn-ghost btn-block"
				style="font-size:11px;"
				onclick={simulateIncomingChallenge}
			>
				◎ SIMULATE INCOMING CHALLENGE
			</button>
		</div>
	</div>

	<!-- center: roster -->
	<div class="panel roster">
		<div class="panel-head">
			<div class="panel-title">PLAYERS <b>{onlineCount}</b> ONLINE</div>
			<LiveDot label="LIVE" />
		</div>
		<div class="roster-body stagger">
			{#if $rosterState === 'loading'}
				<p class="state">Connecting to the arcade…</p>
			{:else if $rosterState === 'error'}
				<p class="state error">Couldn't load the roster.</p>
			{:else if $arcadeRoster.length === 0}
				<p class="state">Nobody's here yet. Be the first!</p>
			{:else}
				{#each $arcadeRoster as p, i (p.id)}
					<RosterRow player={p} {i} onchallenge={challengePlayer} />
				{/each}
			{/if}
		</div>
	</div>

	<!-- right: chat -->
	<div class="panel chat">
		<div class="panel-head">
			<div class="panel-title">LOBBY <b>CHAT</b></div>
			<span class="eyebrow" style="letter-spacing:0.18em;">#main-floor</span>
		</div>
		<div class="chat-body" bind:this={chatScroll}>
			{#if $chatState === 'loading'}
				<p class="state">Loading chat…</p>
			{:else if $chatState === 'error'}
				<p class="state error">Chat failed to load.</p>
			{:else if $messages.length === 0}
				<p class="state">No messages yet — say hi.</p>
			{:else}
				{#each $messages as m, i (i)}
					<ChatLine {m} />
				{/each}
			{/if}
		</div>
		<form class="composer" onsubmit={submitChat}>
			<input
				class="chat-input mono"
				placeholder="type to the room…"
				autocomplete="off"
				bind:value={draft}
			/>
			<button class="btn btn-accent" style="padding:0 16px;" type="submit">SEND</button>
		</form>
	</div>
</div>

{#if matchmakingOpponent}
	<Matchmaking
		opponent={matchmakingOpponent}
		onready={matchReady}
		oncancel={() => (matchmakingOpponent = null)}
	/>
{/if}

{#if $incomingChallenge}
	<ChallengeModal
		challenge={$incomingChallenge}
		onaccept={() => $incomingChallenge && accept($incomingChallenge.id)}
		ondecline={() => $incomingChallenge && declineChallenge($incomingChallenge.id)}
	/>
{/if}

<style>
	.rail {
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		min-height: 0;
	}
	.quick {
		padding: var(--pad);
		display: flex;
		flex-direction: column;
		gap: var(--gap-sm);
	}
	.copy {
		margin: 0 0 4px;
		font-size: 12.5px;
		color: var(--text-dim);
		line-height: 1.5;
	}
	.divider {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 2px 0;
	}
	.divider .rule {
		flex: 1;
		height: 1px;
		background: var(--line);
	}
	.roster,
	.chat {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.roster-body {
		overflow-y: auto;
		padding: 8px;
		display: flex;
		flex-direction: column;
		gap: 2px;
		min-height: 0;
	}
	.chat-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--pad-sm);
		display: flex;
		flex-direction: column;
		gap: 10px;
		min-height: 0;
	}
	.composer {
		display: flex;
		gap: 8px;
		padding: var(--pad-sm);
		border-top: 1px solid var(--line);
	}
	.composer .chat-input {
		flex: 1;
		background: var(--bg-3);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		color: var(--text);
		padding: 10px 12px;
		font-size: var(--fs-sm);
		outline: none;
	}
	.state {
		color: var(--text-faint);
		font-size: var(--fs-sm);
		text-align: center;
		padding: 24px 12px;
	}
	.state.error {
		color: var(--danger);
	}
</style>
