<script lang="ts">
	import '$lib/styles/arcade.css';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { currentUser } from '$lib/supabase/auth';
	import { activeMatchId } from '$lib/supabase/match';
	import Wordmark from '$lib/components/Wordmark.svelte';
	import Avatar from '$lib/components/Avatar.svelte';

	let { children } = $props();

	let path = $derived(page.url.pathname);
	let onEnter = $derived(path === '/enter');
	let me = $derived($currentUser);

	// Entry guard (client-side; ssr is off). Redirect to /enter until entered,
	// and away from /enter once a session exists.
	$effect(() => {
		if (!me && !onEnter) goto('/enter');
		else if (me && onEnter) goto('/');
	});

	const tabs = [
		{ key: 'lobby', label: 'LOBBY', href: '/' },
		{ key: 'game', label: 'GAME', href: '/game' },
		{ key: 'leaderboard', label: 'SCORES', href: '/leaderboard' },
		{ key: 'history', label: 'HISTORY', href: '/history' }
	];

	function isActive(key: string): boolean {
		if (key === 'lobby') return path === '/';
		if (key === 'game') return path.startsWith('/game');
		if (key === 'leaderboard') return path === '/leaderboard';
		if (key === 'history') return path === '/history';
		return false;
	}

	let gameHref = $derived($activeMatchId ? `/game/${$activeMatchId}` : null);
</script>

{#if onEnter}
	{@render children()}
{:else if me}
	<div class="shell">
		<header class="topbar">
			<Wordmark />
			<nav class="nav">
				{#each tabs as t (t.key)}
					{#if t.key === 'game'}
						{#if gameHref}
							<a class="nav-item" class:active={isActive('game')} href={gameHref}>{t.label}</a>
						{:else}
							<span class="nav-item disabled" aria-disabled="true" title="No active game">{t.label}</span>
						{/if}
					{:else}
						<a class="nav-item" class:active={isActive(t.key)} href={t.href}>{t.label}</a>
					{/if}
				{/each}
			</nav>
			<div class="me-chip">
				<Avatar sprite={me.sprite} status="lobby" size={30} />
				<div style="line-height:1.2;">
					<div class="mono handle">{me.name}</div>
					<div class="record">{me.wins}W · {me.losses}L</div>
				</div>
			</div>
		</header>
		<main style="min-height:0;">
			{@render children()}
		</main>
	</div>
{:else}
	<!-- redirecting to /enter -->
	<div class="redirecting"></div>
{/if}

<!-- CRT atmosphere: three fixed overlays above app content, pointer-events:none -->
<div class="crt-vignette"></div>
<div class="crt-scanlines"></div>
<div class="crt-grain"></div>

<style>
	.nav-item {
		text-decoration: none;
	}
	.nav-item.disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}
	.me-chip .handle {
		font-weight: 700;
		font-size: 13px;
		color: var(--text);
	}
	.me-chip .record {
		font-size: 10px;
		color: var(--text-faint);
	}
	.redirecting {
		height: 100%;
	}
</style>
