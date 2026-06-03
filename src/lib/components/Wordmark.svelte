<script lang="ts">
	import PixelSprite from './PixelSprite.svelte';

	let { size = 'var(--fs-wordmark)' }: { size?: string | number } = $props();
</script>

<div class="wordmark">
	<span class="mark" aria-hidden="true">
		<PixelSprite name="invader" size={26} />
	</span>
	<span class="display glow word" style="font-size:{size};">COINDROP</span>
</div>

<style>
	.wordmark {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.mark {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 34px;
		height: 34px;
		color: var(--accent);
	}
	.word {
		line-height: 1;
		color: var(--text);
		letter-spacing: 0.04em;
	}
</style>
