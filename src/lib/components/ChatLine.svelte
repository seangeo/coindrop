<script lang="ts">
	import PixelSprite from './PixelSprite.svelte';
	import type { ChatMessage } from '$lib/supabase/types';

	let { m }: { m: ChatMessage } = $props();
</script>

{#if m.who === '_system'}
	<div class="sys">
		<span class="rule"></span>
		<span class="sys-text"><span class="diamond">◆</span>{m.text}</span>
		<span class="rule"></span>
	</div>
{:else}
	<div class="line">
		<span class="chip" style="color:{m.me ? 'var(--warm)' : 'var(--accent)'};">
			{#if m.sprite}<PixelSprite name={m.sprite} size={16} />{/if}
		</span>
		<div style="min-width:0;">
			<div class="header">
				<span class="who" style="color:{m.me ? 'var(--warm)' : 'var(--accent-bright)'};"
					>{m.who}{m.me ? ' (you)' : ''}</span
				>
				<span class="ts">{m.t}</span>
			</div>
			<div class="body">{m.text}</div>
		</div>
	</div>
{/if}

<style>
	.sys {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 2px 0;
		font-size: 11.5px;
		color: var(--text-faint);
		letter-spacing: 0.04em;
	}
	.sys .rule {
		flex: 1;
		height: 1px;
		background: var(--line);
	}
	.sys-text {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}
	.diamond {
		color: var(--accent-deep);
	}
	.line {
		display: flex;
		gap: 9px;
		align-items: flex-start;
	}
	.chip {
		width: 24px;
		height: 24px;
		flex: none;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border-radius: var(--r-sm);
		margin-top: 1px;
	}
	.header {
		display: flex;
		align-items: baseline;
		gap: 8px;
	}
	.who {
		font-family: var(--font-mono);
		font-weight: 700;
		font-size: 12px;
	}
	.ts {
		font-size: 10px;
		color: var(--text-faint);
	}
	.body {
		font-size: var(--fs-sm);
		color: var(--text);
		line-height: 1.45;
		word-break: break-word;
	}
</style>
