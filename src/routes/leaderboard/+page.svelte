<script lang="ts">
	import PixelSprite from '$lib/components/PixelSprite.svelte';
	import { leaderboard, leaderboardState } from '$lib/supabase/leaderboard';

	function pct(wins: number, losses: number): number {
		return Math.round((wins / Math.max(1, wins + losses)) * 100);
	}
	function rankColor(i: number): string {
		if (i === 0) return 'var(--warm)';
		if (i < 3) return 'var(--accent-bright)';
		return 'var(--text-faint)';
	}
	function rankShadow(i: number): string {
		if (i === 0) return '0 0 12px var(--warm-glow)';
		if (i < 3) return '0 0 10px var(--accent-glow)';
		return 'none';
	}
</script>

<div class="wrap">
	<div class="inner">
		<div class="head">
			<div class="eyebrow" style="margin-bottom:8px;">★ HALL OF FAME ★</div>
			<h1 class="display glow" style="margin:0; font-size:var(--fs-title); letter-spacing:0.05em;">
				HIGH SCORES
			</h1>
		</div>

		<div class="panel table">
			<div class="lb-row lb-head">
				<span>RANK</span>
				<span>PLAYER</span>
				<span style="text-align:right;">WINS</span>
				<span style="text-align:right;">WIN %</span>
				<span style="text-align:right;">RECORD</span>
			</div>

			{#if $leaderboardState === 'loading'}
				<p class="state">Tallying the high scores…</p>
			{:else if $leaderboardState === 'error'}
				<p class="state error">Couldn't load the leaderboard.</p>
			{:else if $leaderboard.length === 0}
				<p class="state">No scores yet.</p>
			{:else}
				<div class="stagger rows">
					{#each $leaderboard as p, i (p.id)}
						<div class="lb-row" class:lb-me={p.you} style="animation-delay: calc({0.05 * i}s / var(--anim,1));">
							<span class="display rank" style="color:{rankColor(i)}; text-shadow:{rankShadow(i)};">
								{String(i + 1).padStart(2, '0')}
							</span>
							<span class="player">
								<span class="chip" style="color:{i === 0 ? 'var(--warm)' : 'var(--accent)'};">
									<PixelSprite name={p.sprite} size={20} />
								</span>
								<span class="mono pname" style="color:{p.you ? 'var(--accent-bright)' : 'var(--text)'};">
									{p.name}{p.you ? ' (you)' : ''}
								</span>
								{#if i === 0}<span class="crown">👑</span>{/if}
							</span>
							<span class="display wins">{p.wins}</span>
							<span class="winpct">{pct(p.wins, p.losses)}%</span>
							<span class="rec">{p.wins}-{p.losses}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.wrap {
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: var(--pad);
		overflow: hidden;
	}
	.inner {
		width: min(760px, 100%);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.head {
		text-align: center;
		margin-bottom: var(--pad);
	}
	.table {
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.rows {
		overflow-y: auto;
		min-height: 0;
	}
	.rank {
		font-size: 18px;
	}
	.player {
		display: flex;
		align-items: center;
		gap: 11px;
		min-width: 0;
	}
	.chip {
		width: 30px;
		height: 30px;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r-sm);
	}
	.pname {
		font-weight: 700;
		font-size: 14px;
	}
	.crown {
		font-size: 13px;
	}
	.wins {
		text-align: right;
		font-size: 17px;
		color: var(--text);
	}
	.winpct {
		text-align: right;
		font-size: 13px;
		color: var(--text-dim);
	}
	.rec {
		text-align: right;
		font-size: 12px;
		color: var(--text-faint);
	}
	.state {
		color: var(--text-faint);
		font-size: var(--fs-sm);
		text-align: center;
		padding: 28px 12px;
	}
	.state.error {
		color: var(--danger);
	}
</style>
