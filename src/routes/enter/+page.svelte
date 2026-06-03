<script lang="ts">
	import Wordmark from '$lib/components/Wordmark.svelte';
	import SpritePicker from '$lib/components/SpritePicker.svelte';
	import PixelSprite from '$lib/components/PixelSprite.svelte';
	import { enterArcade } from '$lib/supabase/auth';
	import { joinArcade } from '$lib/supabase/presence';
	import { SPRITE_NAMES, type SpriteName } from '$lib/sprites';

	let handle = $state('');
	let sprite = $state<SpriteName>('ship');
	let pending = $state(false);
	let error = $state<string | null>(null);

	let canEnter = $derived(handle.trim().length > 0 && !pending);

	async function submit(e: Event) {
		e.preventDefault();
		if (!canEnter) return;
		pending = true;
		error = null;
		try {
			await enterArcade(handle, sprite);
			await joinArcade();
			// The layout guard navigates to the lobby once currentUser is set.
		} catch {
			error = 'Could not enter the arcade. Try again.';
			pending = false;
		}
	}

	function shuffleSprite() {
		const others = SPRITE_NAMES.filter((s) => s !== sprite);
		sprite = others[Math.floor(Math.random() * others.length)];
	}
</script>

<div class="enter">
	<form class="panel card" onsubmit={submit}>
		<div class="brand"><Wordmark size={34} /></div>
		<div class="eyebrow tagline">◎ &nbsp;INSERT COIN TO PLAY&nbsp; ◎</div>

		<div class="preview">
			<button type="button" class="preview-tile" onclick={shuffleSprite} title="Shuffle sprite">
				<PixelSprite name={sprite} size={56} />
			</button>
		</div>

		<label class="field">
			<span class="eyebrow">Handle</span>
			<input
				class="chat-input handle-input mono"
				type="text"
				maxlength="14"
				placeholder="PICK A HANDLE"
				autocomplete="off"
				bind:value={handle}
			/>
		</label>

		<div class="field">
			<span class="eyebrow">Choose your sprite</span>
			<SpritePicker value={sprite} onselect={(s) => (sprite = s)} />
		</div>

		{#if error}<div class="error">{error}</div>{/if}

		<button class="btn btn-accent btn-block btn-lg enter-btn" type="submit" disabled={!canEnter}>
			{pending ? 'DROPPING IN…' : '▸ ENTER ARCADE'}
		</button>
	</form>
</div>

<style>
	.enter {
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 22px;
	}
	.card {
		width: min(440px, 100%);
		padding: 28px var(--pad) var(--pad);
		display: flex;
		flex-direction: column;
		gap: var(--gap);
		text-align: center;
		box-shadow: 0 0 60px -16px var(--accent-glow);
	}
	.brand {
		display: flex;
		justify-content: center;
	}
	.tagline {
		color: var(--accent);
		letter-spacing: 0.3em;
		margin-top: -2px;
	}
	.preview {
		display: flex;
		justify-content: center;
		margin: 4px 0 2px;
	}
	.preview-tile {
		width: 92px;
		height: 92px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-3);
		border: 1px solid var(--accent-line);
		border-radius: var(--r);
		color: var(--accent);
		cursor: pointer;
		box-shadow: inset 0 0 22px -6px var(--accent-glow);
		transition:
			transform 0.08s,
			box-shadow 0.2s;
	}
	.preview-tile:hover {
		transform: translateY(-1px);
		box-shadow:
			inset 0 0 22px -6px var(--accent-glow),
			0 0 18px -6px var(--accent-glow);
	}
	.field {
		display: flex;
		flex-direction: column;
		gap: 8px;
		text-align: left;
	}
	.field .eyebrow {
		text-align: center;
	}
	.handle-input {
		background: var(--bg-3);
		border: 1px solid var(--line);
		border-radius: var(--r-sm);
		color: var(--text);
		padding: 12px 14px;
		font-size: var(--fs-h);
		font-weight: 700;
		letter-spacing: 0.14em;
		text-align: center;
		text-transform: uppercase;
		outline: none;
	}
	.error {
		color: var(--danger);
		font-size: var(--fs-sm);
	}
	.enter-btn {
		margin-top: 4px;
		letter-spacing: 0.1em;
	}
</style>
