<script lang="ts">
	import PixelSprite from '$lib/components/PixelSprite.svelte';
	import MarkX from '$lib/components/MarkX.svelte';
	import MarkO from '$lib/components/MarkO.svelte';
	import { matchHistory, historyState } from '$lib/supabase/history';

	let stats = $derived(
		$matchHistory.reduce(
			(a, h) => {
				a[h.result] += 1;
				return a;
			},
			{ win: 0, loss: 0, draw: 0 }
		)
	);
</script>

<div class="wrap">
	<div class="inner">
		<div class="head">
			<div>
				<div class="eyebrow" style="margin-bottom:6px;">YOUR CABINET</div>
				<h1 class="display" style="margin:0; font-size:var(--fs-title); white-space:nowrap;">
					MATCH HISTORY
				</h1>
			</div>
			<div class="stats">
				<div class="stat">
					<div class="display n" style="color:var(--accent); text-shadow:0 0 12px var(--accent-glow);">
						{stats.win}
					</div>
					<div class="eyebrow" style="letter-spacing:0.16em;">WINS</div>
				</div>
				<div class="stat">
					<div class="display n" style="color:var(--danger); text-shadow:0 0 12px var(--danger-glow);">
						{stats.loss}
					</div>
					<div class="eyebrow" style="letter-spacing:0.16em;">LOSSES</div>
				</div>
				<div class="stat">
					<div class="display n" style="color:var(--text-dim);">{stats.draw}</div>
					<div class="eyebrow" style="letter-spacing:0.16em;">DRAWS</div>
				</div>
			</div>
		</div>

		<div class="panel list">
			{#if $historyState === 'loading'}
				<p class="state">Loading your games…</p>
			{:else if $historyState === 'error'}
				<p class="state error">Couldn't load your history.</p>
			{:else if $matchHistory.length === 0}
				<p class="state">No games yet — go win one.</p>
			{:else}
				<div class="stagger rows">
					{#each $matchHistory as h, i (i)}
						<div class="hist-row" style="animation-delay: calc({0.04 * i}s / var(--anim,1));">
							<span class="result-chip result-{h.result}">{h.result.toUpperCase()}</span>
							<span class="opp">
								<span class="vs">vs</span>
								<span class="chip"><PixelSprite name={h.oppSprite} size={18} /></span>
								<span class="mono oname">{h.opp}</span>
							</span>
							<span class="played">
								played
								<span style="color:{h.mark === 'X' ? 'var(--accent)' : 'var(--warm)'}; display:flex;">
									{#if h.mark === 'X'}<MarkX size={15} />{:else}<MarkO size={15} />{/if}
								</span>
							</span>
							<span class="when">{h.when}</span>
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
		width: min(680px, 100%);
		display: flex;
		flex-direction: column;
		min-height: 0;
	}
	.head {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		margin-bottom: var(--pad);
		flex-wrap: wrap;
		gap: 12px;
	}
	.stats {
		display: flex;
		gap: 18px;
	}
	.stat {
		text-align: center;
	}
	.stat .n {
		font-size: 26px;
		line-height: 1;
	}
	.list {
		overflow-y: auto;
		min-height: 0;
		padding: 8px;
	}
	.rows {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.opp {
		display: flex;
		align-items: center;
		gap: 11px;
		flex: 1;
		min-width: 0;
	}
	.vs {
		font-size: 12px;
		color: var(--text-faint);
	}
	.chip {
		width: 28px;
		height: 28px;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r-sm);
		color: var(--accent);
	}
	.oname {
		font-weight: 700;
		font-size: 14px;
	}
	.played {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: var(--text-faint);
		font-size: 12px;
	}
	.when {
		font-size: 12px;
		color: var(--text-faint);
		min-width: 78px;
		text-align: right;
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
